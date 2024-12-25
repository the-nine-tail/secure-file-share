from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey
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