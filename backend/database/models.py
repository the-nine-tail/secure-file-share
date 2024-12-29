from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from database.config import Base


class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    password = Column(String)
    mfa_secret = Column(String)
    mfa_active = Column(Boolean, default=False)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 


class File(Base):
    __tablename__ = "files"

    file_id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filesize = Column(Integer, nullable=False)
    filetype = Column(String, nullable=False)
    extension = Column(String, nullable=False)
    height = Column(Integer, nullable=True)  # Nullable for non-image files
    width = Column(Integer, nullable=True)   # Nullable for non-image files
    user_email = Column(String, ForeignKey("users.email"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 


class PublicKeyMapping(Base):
    __tablename__ = "public_key_mapping"
    
    email = Column(String, primary_key=True, index=True)
    public_key = Column(String, nullable=False)  # base64 encoded SPKI format
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EncryptedFileShare(Base):
    __tablename__ = "encrypted_files"

    file_id = Column(String, primary_key=True)
    owner_email = Column(String, nullable=False)
    encrypted_keys = Column(JSON, nullable=False) # Format: { "email@example.com": { "key": "encrypted_key_base64", "permission": "view|download", "expires_at": "1735465000" } }
    file_metadata = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
