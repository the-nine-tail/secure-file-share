import json
import os
from typing import Dict
import uuid
from fastapi import APIRouter, HTTPException, Request, Response, Depends, UploadFile
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from base64 import b64decode
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.hashes import SHA256
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import File
from models.file import FileMetadata, FileResponse

router = APIRouter()
DATA_FOLDER = "uploaded_data"

def generate_rsa_keypair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,  # or 4096 for stronger security
    )
    return private_key

@router.get("/publicKey")
async def get_public_key():
    """
    Returns the server's RSA public key in PEM format.
    """

    private_key = generate_rsa_keypair()
    # Save the private key (PEM format)
    with open("server_private_key.pem", "wb") as f:
        f.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            )
        )
    
    # Save the public key (PEM format)
    public_key = private_key.public_key()
    with open("server_public_key.pem", "wb") as f:
        f.write(
            public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
        )

    print("RSA key pair generated and saved.")

    os.makedirs(DATA_FOLDER, exist_ok=True)

    # Load RSA keys from disk
    with open("server_public_key.pem", "rb") as f:
        SERVER_PUBLIC_KEY_PEM = f.read()

    
    # Returning as plain text so the client can store it directly
    return SERVER_PUBLIC_KEY_PEM


@router.post("/uploadEncrypted", response_model=FileResponse)
async def upload_encrypted_file(
    request: Request,
    db: Session = Depends(get_db)
):
    try:

        data = await request.json()
        if not data:
            raise HTTPException(status_code=400, detail="No JSON found in request.")
        
        encrypted_file_b64 = data.get("encryptedFile")
        encrypted_key_b64 = data.get("encryptedKey")
        file_metadata = FileMetadata(**data.get("metadata"))

        if not encrypted_file_b64 or not encrypted_key_b64:
            raise HTTPException(
                    status_code=400,
                    detail="Missing 'encryptedFile' or 'encryptedKey' in JSON body.",
                )
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())

        # Write the encrypted file content
        with open(os.path.join(DATA_FOLDER, f"{file_id}.enc"), "w") as f:
            f.write(encrypted_file_b64)

        # Write the encrypted AES key
        with open(os.path.join(DATA_FOLDER, f"{file_id}.key"), "w") as f:
            f.write(encrypted_key_b64)
        
        # Create new file record
        db_file = File(
            file_id=file_id,
            filename=file_metadata.filename,
            filesize=file_metadata.filesize,
            filetype=file_metadata.filetype,
            extension=file_metadata.extension,
            height=file_metadata.height,
            width=file_metadata.width,
            user_email="suroliasahdev@gmail.com"
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return FileResponse(
            file_id=db_file.file_id,
            filename=db_file.filename,
            filesize=db_file.filesize,
            filetype=db_file.filetype,
            extension=db_file.extension,
            height=db_file.height,
            width=db_file.width,
            user_email="suroliasahdev@gmail.com"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/downloadDecrypted/{file_id}")
def download_decrypted(file_id: str, db: Session = Depends(get_db)):

    with open("server_private_key.pem", "rb") as f:
        SERVER_PRIVATE_KEY_PEM = f.read()

    file_path = os.path.join(DATA_FOLDER, f"{file_id}.enc")
    key_path = os.path.join(DATA_FOLDER, f"{file_id}.key")
    if not os.path.exists(file_path) or not os.path.exists(key_path):
        raise HTTPException(status_code=404, detail="File not found.")

    with open(file_path, "r") as f:
        encrypted_file_b64 = f.read()

    with open(key_path, "r") as f:
        encrypted_key_b64 = f.read()

    encrypted_file = b64decode(encrypted_file_b64)
    encrypted_key = b64decode(encrypted_key_b64)

    # Load private key
    private_key = serialization.load_pem_private_key(
        SERVER_PRIVATE_KEY_PEM,
        password=None
    )

    # Decrypt the ephemeral AES key using RSA private key
    aes_key = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=SHA256()),
            algorithm=SHA256(),
            label=None
        )
    )

    # The first 12 bytes is the GCM IV (for example)
    iv = encrypted_file[:12]
    ciphertext_and_tag = encrypted_file[12:]
    ciphertext = ciphertext_and_tag[:-16]
    auth_tag = encrypted_file[-16:]

    # Decrypt with AES-GCM
    decryptor = Cipher(
        algorithms.AES(aes_key),
        modes.GCM(iv, auth_tag)
    ).decryptor()

    plaintext = decryptor.update(ciphertext) + decryptor.finalize()

     # Get file record
    file = db.query(File).filter(
        File.file_id == file_id,
        File.user_email == "suroliasahdev@gmail.com"
    ).first()

    metadata = {
        "file_id": file.file_id,
        "filename": file.filename,
        "filesize": file.filesize,
        "filetype": file.filetype,
        "extension": file.extension,
        "height": file.height,
        "width": file.width
    }

    print("metadata", metadata)

    # Return the plaintext as a downloadable file, or JSON, etc.
    return Response(
        content=plaintext, 
        media_type="application/octet-stream", 
        headers={
            "X-File-Metadata": json.dumps(metadata),
            "Access-Control-Expose-Headers": "X-File-Metadata"
        }
    )

@router.get("/files/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # Get user email from token
        token_data = request.state.token_data
        user_email = token_data["sub"]
        
        # Get file record
        file = db.query(File).filter(
            File.file_id == file_id,
            File.user_email == user_email
        ).first()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
            
        return FileResponse(
            file_id=file.file_id,
            filename=file.filename,
            filesize=file.filesize,
            filetype=file.filetype,
            extension=file.extension,
            height=file.height,
            width=file.width,
            user_email=file.user_email
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))