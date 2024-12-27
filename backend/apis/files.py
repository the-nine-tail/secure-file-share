import os
import uuid
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import EncryptedFileShare, File, PublicKeyMapping
from models.file import DownloadResponse, FileMetadata, FileResponse, PublicKeyUpload, UpdateRecipients, UploadData

router = APIRouter()
DATA_FOLDER = "uploaded_encrypted_files"
os.makedirs(DATA_FOLDER, exist_ok=True)


@router.post("/registerPublicKey")
async def register_public_key(
    data: PublicKeyUpload,
    db: Session = Depends(get_db)
):
    user_email = data.user_email.lower().strip()
    print("user_email", user_email)
    print("public_key_b64", data.public_key_b64)
    db_file = PublicKeyMapping(
        email=user_email,
        public_key=data.public_key_b64,
    )
        
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {"message": f"Public key for {user_email} stored successfully."}


@router.get("/getPublicKey/{user_email}")
def get_public_key(user_email: str, db: Session = Depends(get_db)):
    user_email = user_email.lower().strip()
    public_key = db.query(PublicKeyMapping).filter(PublicKeyMapping.email == user_email).first()
    if not public_key:
        raise HTTPException(status_code=404, detail="User's public key not found.")
    return {"public_key_b64": public_key.public_key}


@router.post("/uploadEncryptedE2EE", response_model=FileResponse)
def upload_encrypted_file(
    data: UploadData,
    db: Session = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    file_metadata = data.file_metadata

    encrypted_files_db = EncryptedFileShare(
        file_id=file_id,
        owner_email=data.owner.lower().strip(),
        encrypted_keys=data.recipients,
        file_metadata=file_metadata.model_dump()
    )

    # Write the encrypted file content
    with open(os.path.join(DATA_FOLDER, f"{file_id}.enc"), "w") as f:
        f.write(data.encryptedFileB64)

    # Create new file record
    db_file = File(
        file_id=file_id,
        filename=file_metadata.filename,
        filesize=file_metadata.filesize,
        filetype=file_metadata.filetype,
        extension=file_metadata.extension,
        height=file_metadata.height,
        width=file_metadata.width,
        user_email=data.owner.lower().strip()
    )

    db.add(encrypted_files_db)
    db.add(db_file)
    db.commit()
    db.refresh(encrypted_files_db)
    db.refresh(db_file)

    return FileResponse(
        file_id=db_file.file_id,
        filename=db_file.filename,
        filesize=db_file.filesize,
        filetype=db_file.filetype,
        extension=db_file.extension,
        height=db_file.height,
        width=db_file.width,
        user_email=data.owner.lower().strip()
    )


@router.get("/downloadEncryptedE2EE/{file_id}", response_model=DownloadResponse)
def download_encrypted_file(
    file_id: str, 
    request: Request, 
    db: Session = Depends(get_db)
):
    try:

        user_email = request.query_params.get("user_email")
        if not user_email:
            raise HTTPException(status_code=400, detail="user_email query param required.")

        user_email = user_email.lower().strip()
        print("file_id", file_id)
        file_entry = db.query(EncryptedFileShare).filter(EncryptedFileShare.file_id == file_id).first()
        print("file_entry", file_entry)
        if not file_entry:
            raise HTTPException(status_code=404, detail="File not found.")

        # Check if user is a recipient or the owner
        if user_email not in file_entry.encrypted_keys and user_email != file_entry.owner_email:
            print(file_entry.encrypted_keys)
            raise HTTPException(status_code=403, detail="You are not a recipient of this file.")

        file_path = os.path.join(DATA_FOLDER, f"{file_id}.enc")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found.")
        
        encryptedFileB64 = ""
        with open(file_path, "r") as f:
            encryptedFileB64 = f.read()

        if user_email in file_entry.encrypted_keys:
            encryptedKeyB64 = file_entry.encrypted_keys[user_email]
        else:
            # If the user is the owner but not in recipients, error out or handle gracefully
            raise HTTPException(
                status_code=403,
                detail="Owner not in recipients list. Possibly a logic error in the front-end."
            )

        return DownloadResponse(
            encryptedFileB64=encryptedFileB64,
            encryptedKeyB64=encryptedKeyB64,
            file_metadata=file_entry.file_metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e.__str__()))
    

@router.patch("/files/{file_id}/recipients")
def update_recipients(
    file_id: str,
    data: UpdateRecipients,
    current_user_email: str = "suroliasahdev@gmail.com", # e.g. from JWT
    db: Session = Depends(get_db)
):
    # 1) Fetch the file entry
    file_entry = db.query(EncryptedFileShare).filter(EncryptedFileShare.file_id == file_id).first()
    if not file_entry:
        raise HTTPException(status_code=404, detail="File not found.")

    # 2) Check if current_user is the owner
    if file_entry.owner_email != current_user_email.lower().strip():
        raise HTTPException(status_code=403, detail="Only owner can update recipients.")

    # 3) Update the existing dictionary of encrypted_keys
    print("old encrypted_keys", file_entry.encrypted_keys)
    updated_keys = dict(file_entry.encrypted_keys)  # a dict
    # Add new recipients
    for user_email, encKey in data.added_keys.items():
        updated_keys[user_email.lower().strip()] = encKey
    # Remove recipients
    for user_email in data.removed_users:
        user_email = user_email.lower().strip()
        if user_email in updated_keys:
            del updated_keys[user_email]

    print("updated_keys", updated_keys)
    file_entry.encrypted_keys = updated_keys
    db.commit()
    db.refresh(file_entry)

    return {"message": "Recipients updated successfully.", "new_keys": updated_keys}


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
