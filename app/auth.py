from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException

from .config import *

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
    )

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("TOKEN RECEIVED:", repr(token))

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        email = payload.get("sub")
        role = payload.get("role")

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            )

        return {
            "email": email,
            "role": role
        }

    except JWTError as e:
        print("JWT ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Token Expired or Invalid"
        )
    
def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(
        password,
        hashed
    )


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {"exp": expire}
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def admin_required(user=Depends(get_current_user)):

    if user["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin Access Required"
        )

    return user


def student_required(user=Depends(get_current_user)):

    if user["role"] != "student":

        raise HTTPException(
            status_code=403,
            detail="Student Access Required"
        )

    return user