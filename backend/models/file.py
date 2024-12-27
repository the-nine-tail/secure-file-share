from pydantic import BaseModel
from typing import Optional

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


class UploadData(BaseModel):
    owner: str
    encryptedFileB64: str
    recipients: dict
    file_metadata: FileMetadata


class DownloadResponse(BaseModel):
    encryptedFileB64: str
    encryptedKeyB64: str
    file_metadata: FileMetadata


class UpdateRecipients(BaseModel):
    added_keys: dict
    removed_users: list[str] = []
