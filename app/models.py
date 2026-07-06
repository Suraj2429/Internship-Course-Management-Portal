from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import ForeignKey



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    applications = relationship(
        "Application",
        back_populates="student"
    )

    course_enrollments = relationship(
        "CourseEnrollment",
        back_populates="student"
    )

    task_submissions = relationship(
        "TaskSubmission",
        back_populates="student"
    )
    
class Internship(Base):

    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    description = Column(String(500))

    duration = Column(String(50))

    vacancies = Column(Integer)

    status = Column(String(20), default="Open")

    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="internship")

    tasks = relationship(
        "Task",
        back_populates="internship"
    )

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

    status = Column(String(20), default="Pending")

    applied_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="applications")

    internship = relationship(
        "Internship",
        back_populates="applications"
    )

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)

    title = Column(String)
    description = Column(String)
    duration = Column(String)
    level = Column(String)

    enrollments = relationship(
        "CourseEnrollment",
        back_populates="course"
    )


class CourseEnrollment(Base):

    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    enrolled_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    student = relationship(
        "User",
        back_populates="course_enrollments"
    )

    course = relationship(
        "Course",
        back_populates="enrollments"
    )

class Task(Base):

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    internship_id = Column(
        Integer,
        ForeignKey("internships.id")
    )

    title = Column(String(150), nullable=False)

    description = Column(String(1000))

    deadline = Column(DateTime)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    internship = relationship(
        "Internship",
        back_populates="tasks"
    )

    submissions = relationship(
        "TaskSubmission",
        back_populates="task"
    )

class TaskSubmission(Base):

    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True)

    task_id = Column(
        Integer,
        ForeignKey("tasks.id")
    )

    student_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    github_link = Column(String(500))

    remarks = Column(String(500))

    # Admin Review
    feedback = Column(String(500))

    marks = Column(Integer, default=0)

    status = Column(
        String(20),
        default="Pending"
    )

    submitted_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    task = relationship(
        "Task",
        back_populates="submissions"
    )

    student = relationship(
        "User",
        back_populates="task_submissions"
    )

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("users.id"))

    internship_id = Column(Integer, ForeignKey("internships.id"))

    certificate_number = Column(String(50), unique=True)

    issued_date = Column(DateTime, default=datetime.utcnow)

    file_path = Column(String(255))

    student = relationship("User")

    internship = relationship("Internship")