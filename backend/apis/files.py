from datetime import datetime
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends
from dependencies.permissions import require_permissions
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import EncryptedFileShare, File, PublicKeyMapping, User
from models.file import DownloadResponse, FileResponse, PublicKeyUpload, UpdateRecipients, UploadData, FileListResponse
from dependencies.auth import get_current_user
from typing import Tuple, List

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
@require_permissions(["upload_file"])
def upload_encrypted_file(
    data: UploadData,
    current_user_data: Tuple[User, str] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user, user_email = current_user_data
    
    # Verify the owner is the current user
    if data.owner.lower().strip() != user_email:
        raise HTTPException(status_code=403, detail="Can only upload files as yourself")
    
    file_id = str(uuid.uuid4())
    file_metadata = data.file_metadata
    print("data.recipients", data.recipients)

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
        user_email=data.owner.lower().strip(),
        created_at=datetime.now(),
        updated_at=datetime.now()
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
        user_email=data.owner.lower().strip(),
        created_at=db_file.created_at,
        updated_at=db_file.updated_at
    )


@router.get("/downloadEncryptedE2EE/{file_id}", response_model=DownloadResponse)
@require_permissions(["download_file"])
def download_encrypted_file(
    file_id: str,
    current_user_data: Tuple[User, str] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user, user_email = current_user_data
    
    try:
        # Use the authenticated user's email instead of query param
        file_entry = db.query(EncryptedFileShare).filter(EncryptedFileShare.file_id == file_id).first()
        if not file_entry:
            raise HTTPException(status_code=404, detail="File not found.")

        # Check if user is a recipient or the owner
        if user_email not in file_entry.encrypted_keys and user_email != file_entry.owner_email:
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
@require_permissions(["share_file"])
def update_recipients(
    file_id: str,
    data: UpdateRecipients,
    current_user_data: Tuple[User, str] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user, user_email = current_user_data
    
    # 1) Fetch the file entry
    file_entry = db.query(EncryptedFileShare).filter(EncryptedFileShare.file_id == file_id).first()
    if not file_entry:
        raise HTTPException(status_code=404, detail="File not found.")

    # 2) Check if current_user is the owner
    if file_entry.owner_email != user_email:
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


@router.get("/files", response_model=FileListResponse)
def get_files(
    current_user_data: Tuple[User, str] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        current_user, user_email = current_user_data
        
        files = db.query(File).filter().all()
        
        # Get files shared with the user
        # shared_files_query = (
        #     db.query(File)
        #     .join(EncryptedFileShare, File.file_id == EncryptedFileShare.file_id)
        #     .filter(
        #         EncryptedFileShare.encrypted_keys.has_key(user_email)  # type: ignore
        #     )
        # )
        # shared_files = shared_files_query.all()
        
        # # Combine and deduplicate files
        # all_files = {file.file_id: file for file in owned_files}
        # all_files.update({file.file_id: file for file in shared_files})
        
        # Convert to response model
        file_responses = [
            FileResponse(
                file_id=file.file_id,
                filename=file.filename,
                filesize=file.filesize,
                filetype=file.filetype,
                extension=file.extension,
                height=file.height,
                width=file.width,
                user_email=file.user_email,
                created_at=file.created_at,
                updated_at=file.updated_at
            )
            for file in files
        ]
        
        # Sort by created_at descending (newest first)
        file_responses.sort(key=lambda x: x.created_at, reverse=True)
        
        return FileListResponse(
            files=file_responses,
            total=len(file_responses)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
