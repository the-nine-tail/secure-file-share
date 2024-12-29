from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime

class FileMetadata(BaseModel):
    filename: str
    filesize: int
    filetype: str
    extension: str
    height: Optional[int] = None
    width: Optional[int] = None



class PublicKeyUpload(BaseModel):
    """Used when a user registers their public key with the server."""
    user_email: str
    public_key_b64: str  # base64-encoded SPKI



class FileResponse(BaseModel):
    file_id: str
    filename: str
    filesize: int
    filetype: str
    extension: str
    height: Optional[int] = None
    width: Optional[int] = None
    user_email: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class RecipientAccess(BaseModel):
    key: str
    permission: str
    expires_at: Optional[int] = None
class UploadData(BaseModel):
    owner: str
    encryptedFileB64: str
    recipients: Dict[str, RecipientAccess]
    file_metadata: FileMetadata


class DownloadResponse(BaseModel):
    encryptedFileB64: str
    encryptedKeyB64: str
    file_metadata: FileMetadata


class UpdateRecipients(BaseModel):
    added_keys: Dict[str, RecipientAccess]
    removed_users: list[str] = []


class FileListResponse(BaseModel):
    files: List[FileResponse]
    total: int
