from pydantic import BaseModel
from typing import Optional

class FileMetadata(BaseModel):
    filename: str
    filesize: int
    filetype: str
    extension: str
    height: Optional[int] = None
    width: Optional[int] = None

class FileResponse(FileMetadata):
    file_id: str
    user_email: str 