from pydantic import BaseModel
from typing import Optional

# class FileMetadata(BaseModel):
#     filename: str
#     filesize: int
#     filetype: str
#     extension: str
#     height: Optional[int] = None
#     width: Optional[int] = None



class PublicKeyUpload(BaseModel):
    """Used when a user registers their public key with the server."""
    user_email: str
    public_key_b64: str  # base64-encoded SPKI


class FileMetadata(BaseModel):
    filename: str
    filetype: str = ""
    filesize: int = 0

class FileResponse(FileMetadata):
    file_id: str
    user_email: str 

class UploadData(BaseModel):
    """Used when uploading a file with multiple encrypted AES keys."""
    owner: str
    encryptedFileB64: str
    recipients: dict  # { "alice@example.com": <AESKeyEncForAlice>, "bob@example.com": <AESKeyEncForBob>, ... }
    metadata: FileMetadata

class FileResponse(BaseModel):
    fileId: str
    message: str

class DownloadResponse(BaseModel):
    encryptedFileB64: str
    encryptedKeyB64: str
