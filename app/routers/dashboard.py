from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from ..database import SessionLocal

from ..models import (
    User,
    Internship,
    Course,
    CourseEnrollment,
    Application,
    Task,
    TaskSubmission
)

from ..auth import (
    admin_required,
    student_required
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Student Dashboard
@router.get("/student")
def student_dashboard(
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = db.query(User).filter(
        User.email == user["email"]
    ).first()

    applied = db.query(Application).filter(
        Application.student_id == student.id
    ).count()

    approved = db.query(Application).filter(
        Application.student_id == student.id,
        Application.status == "Approved"
    ).count()

    enrolled = db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == student.id
    ).count()

    submissions = db.query(TaskSubmission).filter(
        TaskSubmission.student_id == student.id
    ).all()

    completed = len([
        s for s in submissions
        if s.status == "Approved"
    ])

    pending = len([
        s for s in submissions
        if s.status == "Pending"
    ])

    total_marks = sum(s.marks for s in submissions)

    average_marks = (
        total_marks // completed
        if completed > 0
        else 0
    )

    total_tasks = db.query(Task).count()

    progress = (
        int((completed / total_tasks) * 100)
        if total_tasks > 0
        else 0
    )

    return {

        "student": {
            "name": student.full_name,
            "email": student.email
        },

        "statistics": {

            "applied_internships": applied,

            "approved_internships": approved,

            "enrolled_courses": enrolled,

            "assigned_tasks": total_tasks,

            "completed_tasks": completed,

            "pending_tasks": pending,

            "average_marks": average_marks,

            "overall_progress": progress

        },

        "certificate_eligible": progress >= 80

    }

#Admin Dashboard
@router.get("/admin")
def admin_dashboard(
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    return {

        "students": db.query(User).filter(
            User.role == "student"
        ).count(),

        "admins": db.query(User).filter(
            User.role == "admin"
        ).count(),

        "internships": db.query(
            Internship
        ).count(),

        "courses": db.query(
            Course
        ).count(),

        "applications": db.query(
            Application
        ).count(),

        "approved_applications": db.query(
            Application
        ).filter(
            Application.status == "Approved"
        ).count(),

        "pending_applications": db.query(
            Application
        ).filter(
            Application.status == "Pending"
        ).count(),

        "tasks": db.query(
            Task
        ).count(),

        "submissions": db.query(
            TaskSubmission
        ).count(),

        "approved_submissions": db.query(
            TaskSubmission
        ).filter(
            TaskSubmission.status == "Approved"
        ).count(),

        "pending_submissions": db.query(
            TaskSubmission
        ).filter(
            TaskSubmission.status == "Pending"
        ).count()

    }