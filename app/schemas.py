from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class InternshipCreate(BaseModel):
    title: str
    description: str
    duration: str
    vacancies: int

class InternshipUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    vacancies: Optional[int] = None
    status: Optional[str] = None


class InternshipResponse(BaseModel):
    id: int
    title: str
    description: str
    duration: str
    vacancies: int
    status: str

    class Config:
        from_attributes = True