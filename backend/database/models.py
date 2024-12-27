from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey, JSON, LargeBinary
from sqlalchemy.sql import func
from database.config import Base

class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    password = Column(String)
    mfa_secret = Column(String)
    mfa_active = Column(Boolean, default=False)
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

    # def to_dict(self):
    #     return {
    #         "email": self.email,
    #         "public_key": self.public_key
    #     }

class EncryptedFileShare(Base):
    __tablename__ = "encrypted_file_shares"
    
    file_id = Column(String, primary_key=True)
    owner_email = Column(String, ForeignKey("users.email"), nullable=False)
    encrypted_content = Column(String, nullable=False)  # The encrypted file content
    encrypted_keys = Column(JSON, nullable=False)  # Dictionary of recipient emails to their encrypted AES keys
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # def to_dict(self):
    #     return {
    #         "file_id": self.file_id,
    #         "owner": self.owner_email,
    #         "encryptedFileB64": self.encrypted_content,  # Will need to be base64 encoded when serving
    #         "recipients": self.encrypted_keys,
    #         "metadata": self.metadata
    #     }

    # @property
    # def recipient_list(self):
    #     """Returns list of emails who have access to this file"""
    #     return list(self.encrypted_keys.keys())

    # def can_access(self, email: str) -> bool:
    #     """Check if a given email has access to this file"""
    #     return email in self.encrypted_keys or email == self.owner_email

    # def add_recipient(self, email: str, encrypted_key: str):
    #     """Add a new recipient with their encrypted AES key"""
    #     if not self.encrypted_keys:
    #         self.encrypted_keys = {}
    #     self.encrypted_keys[email] = encrypted_key 
