from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Course, CourseEnrollment, User
from ..schemas import (
    CourseCreate,
    CourseUpdate,
    CourseEnrollmentCreate
)
from ..auth import (
    admin_required,
    student_required
)

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


# Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Admin APIs
# -----------------------------

# Create Course
@router.post("/")
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    new_course = Course(
        title=course.title,
        description=course.description,
        duration=course.duration,
        level=course.level
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return {
        "message": "Course created successfully",
        "course": new_course
    }


# View All Courses
@router.get("/")
def get_courses(
    db: Session = Depends(get_db)
):
    return db.query(Course).all()


# Update Course
@router.put("/{course_id}")
def update_course(
    course_id: int,
    updated: CourseUpdate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    update_data = updated.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    return {
        "message": "Course updated successfully",
        "course": course
    }


# Delete Course
@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }


# -----------------------------
# Student APIs
# -----------------------------

# Enroll in a Course
@router.post("/enroll")
def enroll_course(
    enrollment: CourseEnrollmentCreate,
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    # Get logged-in student
    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    # Check if course exists
    course = (
        db.query(Course)
        .filter(Course.id == enrollment.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # Check if already enrolled
    existing = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.student_id == student.id,
            CourseEnrollment.course_id == enrollment.course_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already enrolled in this course"
        )

    # Save enrollment
    new_enrollment = CourseEnrollment(
        student_id=student.id,
        course_id=enrollment.course_id
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return {
        "message": "Course enrolled successfully"
    }


# View My Courses
@router.get("/my")
def my_courses(
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    # Get logged-in student
    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    # Get all enrolled courses
    enrollments = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.student_id == student.id
        )
        .all()
    )

    result = []

    # Prepare response with course details
    for enrollment in enrollments:

        result.append({

            "enrollment_id": enrollment.id,

            "course": {
                "id": enrollment.course.id,
                "title": enrollment.course.title,
                "description": enrollment.course.description,
                "duration": enrollment.course.duration,
                "level": enrollment.course.level
            },

            "enrolled_at": enrollment.enrolled_at
        })

    return result