from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"
    mfa_active: bool = False

class UserLogin(BaseModel):
    email: str
    password: str
    mfa_code: str | None = None

class UserResponse(BaseModel):
    email: str
    full_name: str
    mfa_secret: str | None = None
    mfa_uri: str | None = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    requires_mfa: bool = False

# New model for user data
class UserData(BaseModel):
    email: str
    full_name: str
    role: str = "user"
    mfa_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True