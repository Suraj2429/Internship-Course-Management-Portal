from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String(255), nullable=False)

    role = Column(String(20), default="student")

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class Internship(Base):

    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    description = Column(String(500))

    duration = Column(String(50))

    vacancies = Column(Integer)

    status = Column(String(20), default="Open")

    created_at = Column(DateTime, default=datetime.utcnow)


class Application(Base):

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    internship_id = Column(
        Integer,
        ForeignKey("internships.id")
    )

    status = Column(
        String(20),
        default="Pending"
    )

    applied_at = Column(
        DateTime,
        default=datetime.utcnow
    )