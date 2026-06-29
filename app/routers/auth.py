from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..database import SessionLocal
from ..models import Application, User
from ..schemas import UserRegister
from ..auth import hash_password
from ..schemas import UserLogin
from ..auth import(
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: UserRegister):

    db: Session = SessionLocal()

    existing = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing:

        db.close()

        return {
            "message": "Email already registered."
        }

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return {
        "message": "Registration Successful"
    }

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Debugging (remove later)
    print("USERNAME RECEIVED:", form_data.username)

    db_user = (
        db.query(User)
        .filter(User.email == form_data.username.strip().lower())
        .first()
    )

    print("DB USER:", db_user)

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

