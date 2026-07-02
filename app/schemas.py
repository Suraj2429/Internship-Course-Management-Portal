from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Authentication Schemas
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


# Internship Schemas
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


# Internship Application Schemas
class ApplicationCreate(BaseModel):
    internship_id: int


class ApplicationStatusUpdate(BaseModel):
    status: str


# Course Schemas

class CourseCreate(BaseModel):
    title: str
    description: str
    duration: str
    level: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None


class CourseEnrollmentCreate(BaseModel):
    course_id: int


class TaskCreate(BaseModel):

    internship_id: int

    title: str

    description: str

    deadline: datetime


class TaskSubmissionCreate(BaseModel):

    task_id: int

    github_link: str

    remarks: str


class TaskStatusUpdate(BaseModel):

    status: str

class TaskUpdate(BaseModel):

    title: str | None = None
    description: str | None = None
    deadline: datetime | None = None

class TaskSubmissionResponse(BaseModel):

    id: int

    github_link: str

    remarks: str

    status: str

    submitted_at: datetime

    class Config:
        from_attributes = True

class SubmissionReview(BaseModel):

    status: str

    feedback: str

    marks: int


#Certificate Schemas
class CertificateCreate(BaseModel):

    student_id: int

    internship_id: int