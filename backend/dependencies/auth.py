from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import User
from auth.auth_handler import AuthHandler
from typing import Tuple

auth_handler = AuthHandler()

async def get_current_user_email(
    request: Request,
) -> str:
    """Extract user email from JWT token"""
    token_data = auth_handler.auth_wrapper(request)
    return token_data.get("sub")

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Tuple[User, str]:
    """Get current user from database using JWT token"""
    user_email = await get_current_user_email(request)
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user, user_email 