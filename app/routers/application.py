from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Application, Internship, User
from ..auth import student_required, admin_required

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{internship_id}")
def apply_internship(
    internship_id: int,
    user=Depends(student_required),
    db: Session = Depends(get_db)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    internship = (
        db.query(Internship)
        .filter(Internship.id == internship_id)
        .first()
    )

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    existing = (
        db.query(Application)
        .filter(
            Application.student_id == student.id,
            Application.internship_id == internship_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already Applied"
        )

    application = Application(
        student_id=student.id,
        internship_id=internship.id
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application Submitted Successfully"
    }

@router.get("/my")
def my_applications(
    user=Depends(student_required),
    db: Session = Depends(get_db)
):

    # Get logged-in student
    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )


    # Get student's applications
    applications = (
        db.query(Application)
        .filter(
            Application.student_id == student.id
        )
        .all()
    )


    result = []


    # Add internship details
    for application in applications:

        internship = (
            db.query(Internship)
            .filter(
                Internship.id ==
                application.internship_id
            )
            .first()
        )


        result.append({

            "application_id": application.id,

            "status": application.status,

            "internship": {

                "id": internship.id,

                "title": internship.title,

                "description":
                    internship.description,

                "duration":
                    internship.duration,

                "vacancies":
                    internship.vacancies

            }

        })


    return result

# Admin view all applications
@router.get("/")
def all_applications(
    user=Depends(admin_required),
    db: Session = Depends(get_db)
):

    applications = db.query(Application).all()

    result = []

    for application in applications:

        student = (
            db.query(User)
            .filter(
                User.id == application.student_id
            )
            .first()
        )

        internship = (
            db.query(Internship)
            .filter(
                Internship.id == application.internship_id
            )
            .first()
        )

        result.append({

            "application_id": application.id,

            "student": {
                "id": student.id,
                "name": student.full_name,
                "email": student.email
            },

            "internship": {
                "id": internship.id,
                "title": internship.title,
                "duration": internship.duration
            },

            "status": application.status
        })

    return result


@router.put("/{application_id}/approve")
def approve_application(
    application_id: int,
    user=Depends(admin_required),
    db: Session = Depends(get_db)
):

    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.status = "Approved"

    db.commit()

    return {
        "message": "Application Approved"
    }


@router.put("/{application_id}/reject")
def reject_application(
    application_id: int,
    user=Depends(admin_required),
    db: Session = Depends(get_db)
):

    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.status = "Rejected"

    db.commit()

    return {
        "message": "Application Rejected"
    }