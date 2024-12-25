import datetime
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
import os

load_dotenv()

class AuthHandler:
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = os.getenv("JWT_SECRET_KEY")
    refresh_secret = os.getenv("REFRESH_TOKEN_SECRET")
    algorithm = os.getenv("JWT_ALGORITHM")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.datetime.now(datetime.UTC) + expires_delta
        else:
            expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret, algorithm=self.algorithm)
        return encoded_jwt

    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.refresh_secret, algorithm=self.algorithm)

    def decode_token(self, token: str, is_refresh_token: bool = False) -> dict:
        try:
            secret = self.refresh_secret if is_refresh_token else self.secret
            payload = jwt.decode(token, secret, algorithms=[self.algorithm])
            
            if is_refresh_token and payload.get("type") != "refresh":
                raise HTTPException(status_code=401, detail="Invalid refresh token")
                
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def create_tokens(self, data: dict) -> Tuple[str, str]:
        access_token = self.create_access_token(data)
        refresh_token = self.create_refresh_token(data)
        return access_token, refresh_token

    def refresh_tokens(self, refresh_token: str) -> Tuple[str, str]:
        try:
            payload = self.decode_token(refresh_token, is_refresh_token=True)
            
            # Check if refresh token is close to expiration (e.g., less than 1 day remaining)
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                exp_datetime = datetime.datetime.fromtimestamp(exp_timestamp, tz=datetime.UTC)
                time_until_expire = exp_datetime - datetime.datetime.now(datetime.UTC)
                
                # If refresh token has more than 1 day left, only refresh access token
                if time_until_expire > datetime.timedelta(days=1):
                    new_access_token = self.create_access_token({"sub": payload["sub"]})
                    return new_access_token, refresh_token
            
            # If refresh token is close to expiration, refresh both tokens
            new_access_token = self.create_access_token({"sub": payload["sub"]})
            new_refresh_token = self.create_refresh_token({"sub": payload["sub"]})
            return new_access_token, new_refresh_token
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

    def auth_wrapper(self, request: Request) -> dict:
        if not request.cookies or not request.cookies.get("access_token"):
            raise HTTPException(status_code=401, detail="Cookie not found")
        return self.decode_token(request.cookies.get("access_token")) 