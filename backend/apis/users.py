from fastapi import APIRouter, HTTPException, Depends, Response, Request
from sqlalchemy.orm import Session
from models.user import UserCreate, UserLogin, UserResponse, Token, UserData
from database.config import get_db
from database.models import User
from auth.auth_handler import AuthHandler
import pyotp

router = APIRouter()
auth_handler = AuthHandler()

# Helper function to get user from token
async def get_current_user(token_data: dict, db: Session) -> User:
    user_email = token_data.get("sub")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate MFA secret
    mfa_secret = pyotp.random_base32()
    totp = pyotp.TOTP(mfa_secret)
    mfa_uri = totp.provisioning_uri(user_data.email, issuer_name="SecureFileShare")
    
    # Hash password
    hashed_password = auth_handler.get_password_hash(user_data.password)
    
    # Create new user
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        password=hashed_password,
        mfa_secret=mfa_secret,
        mfa_active=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        email=db_user.email,
        full_name=db_user.full_name,
        mfa_secret=mfa_secret,
        mfa_uri=mfa_uri
    )

@router.post("/login", response_model=Token)
async def login(response: Response, user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not auth_handler.verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # If MFA code is not provided, return requires_mfa=True
    if not user_data.mfa_code:
        return Token(requires_mfa=True)
    
    # Verify MFA code
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(user_data.mfa_code):
        raise HTTPException(status_code=401, detail="Invalid MFA code")
    
    # Create tokens
    access_token, refresh_token = auth_handler.create_tokens({"sub": user.email})
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="strict",
        secure=False,  # Set True in production
        max_age=60 * 60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        secure=False,  # Set True in production
        max_age=60 * 60 * 24 * 7
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/activate-mfa")
def activate_mfa(payload: dict, db: Session = Depends(get_db)):
    user_email = payload.get("email").lower().strip();
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.mfa_active = True
    db.commit()
    
    return {"message": "MFA activated successfully"}

@router.post("/refresh", response_model=Token)
async def refresh_token(response: Response, request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    try:
        new_access_token, new_refresh_token = auth_handler.refresh_tokens(refresh_token)
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            samesite="strict",
            secure=False,  # Set True in production (HTTPS)
            max_age=60 * 60  # 60 minutes
        )
        
        # Only set new refresh token cookie if it was renewed
        if new_refresh_token != refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=new_refresh_token,
                httponly=True,
                samesite="strict",
                secure=False,  # Set True in production (HTTPS)
                max_age=60 * 60 * 24 * 7  # 7 days
            )

        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/get-user", response_model=UserData)
async def get_user(
    request: Request,
    db: Session = Depends(get_db)
):
    token_data = auth_handler.auth_wrapper(request)
    user = await get_current_user(token_data, db)
    
    return UserData(
        email=user.email,
        full_name=user.full_name,
        mfa_active=user.mfa_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
