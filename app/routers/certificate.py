from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph

from uuid import uuid4
import os

from ..database import SessionLocal
from ..models import (
    User,
    Internship,
    Certificate,
    TaskSubmission,
    Task
)
from ..schemas import CertificateCreate
from ..auth import admin_required, student_required


router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"]
)


# Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Certificate Storage Folder
CERTIFICATE_DIR = "certificates"
os.makedirs(CERTIFICATE_DIR, exist_ok=True)


# Generate Certificate (Admin)
@router.post("/generate")
def generate_certificate(
    certificate: CertificateCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    # Check student
    student = (
        db.query(User)
        .filter(User.id == certificate.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Check internship
    internship = (
        db.query(Internship)
        .filter(Internship.id == certificate.internship_id)
        .first()
    )

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    # Prevent duplicate certificate
    existing = (
        db.query(Certificate)
        .filter(
            Certificate.student_id == student.id,
            Certificate.internship_id == internship.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Certificate already generated"
        )

    # Check eligibility (80% approved tasks)
    total_tasks = (
        db.query(Task)
        .filter(Task.internship_id == internship.id)
        .count()
    )

    approved_tasks = (
        db.query(TaskSubmission)
        .join(Task)
        .filter(
            TaskSubmission.student_id == student.id,
            TaskSubmission.status == "Approved",
            Task.internship_id == internship.id
        )
        .count()
    )

    progress = 0

    if total_tasks > 0:
        progress = (approved_tasks / total_tasks) * 100

    if progress < 80:
        raise HTTPException(
            status_code=400,
            detail="Student is not eligible for certificate"
        )

    # Generate certificate number
    certificate_number = str(uuid4())[:8].upper()

    filename = f"{certificate_number}.pdf"

    filepath = os.path.join(
        CERTIFICATE_DIR,
        filename
    )

    # Create PDF
    doc = SimpleDocTemplate(filepath)

    styles = getSampleStyleSheet()

    elements = [

        Paragraph(
            "Certificate of Completion",
            styles["Title"]
        ),

        Paragraph(
            f"This certifies that <b>{student.full_name}</b>",
            styles["Heading2"]
        ),

        Paragraph(
            f"has successfully completed the <b>{internship.title}</b> internship.",
            styles["BodyText"]
        ),

        Paragraph(
            f"Certificate Number : <b>{certificate_number}</b>",
            styles["BodyText"]
        )

    ]

    doc.build(elements)

    # Save Certificate
    db_certificate = Certificate(
        student_id=student.id,
        internship_id=internship.id,
        certificate_number=certificate_number,
        file_path=filepath
    )

    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)

    return {
        "message": "Certificate generated successfully",
        "certificate": {
            "id": db_certificate.id,
            "certificate_number": db_certificate.certificate_number
        }
    }


# Student View Certificates
@router.get("/my")
def my_certificates(
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    certificates = (
        db.query(Certificate)
        .filter(Certificate.student_id == student.id)
        .all()
    )

    return certificates


# Download Certificate
@router.get("/download/{certificate_id}")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    certificate = (
        db.query(Certificate)
        .filter(
            Certificate.id == certificate_id,
            Certificate.student_id == student.id
        )
        .first()
    )

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    if not os.path.exists(certificate.file_path):
        raise HTTPException(
            status_code=404,
            detail="Certificate file not found"
        )

    return FileResponse(
        path=certificate.file_path,
        filename=f"{certificate.certificate_number}.pdf",
        media_type="application/pdf"
    )

