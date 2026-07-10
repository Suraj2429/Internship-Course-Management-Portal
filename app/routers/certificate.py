from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle
)

from uuid import uuid4
from datetime import datetime

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

from ..auth import (
    admin_required,
    student_required
)


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


# Certificate Folder
CERTIFICATE_DIR = "certificates"

os.makedirs(
    CERTIFICATE_DIR,
    exist_ok=True
)


# Logo Path
LOGO_PATH = "app/static/images/careerhub-logo.png"


# Draw Certificate Border
def draw_certificate_background(canvas, doc):

    width, height = landscape(A4)

    canvas.saveState()


    # Background
    canvas.setFillColor(
        colors.HexColor("#F8FBFD")
    )

    canvas.rect(
        0,
        0,
        width,
        height,
        fill=1,
        stroke=0
    )


    # Outer Border
    canvas.setStrokeColor(
        colors.HexColor("#073B5C")
    )

    canvas.setLineWidth(6)

    canvas.rect(
        12 * mm,
        12 * mm,
        width - 24 * mm,
        height - 24 * mm
    )


    # Inner Border
    canvas.setStrokeColor(
        colors.HexColor("#06B6D4")
    )

    canvas.setLineWidth(2)

    canvas.rect(
        17 * mm,
        17 * mm,
        width - 34 * mm,
        height - 34 * mm
    )


    # Decorative Top Line
    canvas.setFillColor(
        colors.HexColor("#073B5C")
    )

    canvas.rect(
        17 * mm,
        height - 25 * mm,
        width - 34 * mm,
        8 * mm,
        fill=1,
        stroke=0
    )


    canvas.restoreState()


# Generate Certificate
@router.post("/generate")
def generate_certificate(
    certificate: CertificateCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    # Find Student
    student = (
        db.query(User)
        .filter(
            User.id == certificate.student_id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )


    # Find Internship
    internship = (
        db.query(Internship)
        .filter(
            Internship.id ==
            certificate.internship_id
        )
        .first()
    )


    if not internship:

        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )


    # Check Existing Certificate
    existing = (
        db.query(Certificate)
        .filter(
            Certificate.student_id ==
            student.id,

            Certificate.internship_id ==
            internship.id
        )
        .first()
    )


    if existing:

        raise HTTPException(
            status_code=400,
            detail="Certificate already generated"
        )


    # Count Total Internship Tasks
    total_tasks = (
        db.query(Task)
        .filter(
            Task.internship_id ==
            internship.id
        )
        .count()
    )


    # Count Approved Tasks
    approved_tasks = (
        db.query(TaskSubmission)
        .join(Task)
        .filter(
            TaskSubmission.student_id ==
            student.id,

            TaskSubmission.status ==
            "Approved",

            Task.internship_id ==
            internship.id
        )
        .count()
    )


    # Calculate Progress
    progress = 0

    if total_tasks > 0:

        progress = (
            approved_tasks / total_tasks
        ) * 100


    # Check Eligibility
    if progress < 80:

        raise HTTPException(
            status_code=400,
            detail="Student is not eligible for certificate"
        )


    # Certificate Number
    certificate_number = (
        str(uuid4())[:8].upper()
    )


    filename = (
        f"{certificate_number}.pdf"
    )


    filepath = os.path.join(
        CERTIFICATE_DIR,
        filename
    )


    # Certificate Date
    issue_date = datetime.now().strftime(
        "%d %B %Y"
    )


    # Create PDF
    doc = SimpleDocTemplate(
        filepath,

        pagesize=landscape(A4),

        rightMargin=30 * mm,
        leftMargin=30 * mm,
        topMargin=25 * mm,
        bottomMargin=20 * mm
    )


    # Styles
    organization_style = ParagraphStyle(
        name="Organization",

        fontName="Helvetica-Bold",

        fontSize=18,

        textColor=colors.HexColor(
            "#073B5C"
        ),

        alignment=TA_CENTER,

        spaceAfter=4
    )


    title_style = ParagraphStyle(
        name="CertificateTitle",

        fontName="Helvetica-Bold",

        fontSize=30,

        leading=36,

        textColor=colors.HexColor(
            "#073B5C"
        ),

        alignment=TA_CENTER
    )


    subtitle_style = ParagraphStyle(
        name="Subtitle",

        fontName="Helvetica",

        fontSize=12,

        leading=18,

        textColor=colors.HexColor(
            "#64748B"
        ),

        alignment=TA_CENTER
    )


    student_style = ParagraphStyle(
        name="StudentName",

        fontName="Helvetica-BoldOblique",

        fontSize=25,

        leading=30,

        textColor=colors.HexColor(
            "#0284C7"
        ),

        alignment=TA_CENTER
    )


    internship_style = ParagraphStyle(
        name="Internship",

        fontName="Helvetica-Bold",

        fontSize=18,

        leading=24,

        textColor=colors.HexColor(
            "#073B5C"
        ),

        alignment=TA_CENTER
    )


    detail_style = ParagraphStyle(
        name="Details",

        fontName="Helvetica",

        fontSize=10,

        leading=15,

        textColor=colors.HexColor(
            "#475569"
        ),

        alignment=TA_CENTER
    )


    signature_style = ParagraphStyle(
        name="Signature",

        fontName="Helvetica-Bold",

        fontSize=10,

        textColor=colors.HexColor(
            "#073B5C"
        ),

        alignment=TA_CENTER
    )


    elements = []


    # Add Logo
    if os.path.exists(LOGO_PATH):

        logo = Image(
            LOGO_PATH,
            width=24 * mm,
            height=24 * mm
        )

        elements.append(logo)

        elements.append(
            Spacer(1, 2 * mm)
        )


    # Organization
    elements.append(
        Paragraph(
            "CareerHub",
            organization_style
        )
    )


    elements.append(
        Paragraph(
            "Internship & Course Management Portal",
            subtitle_style
        )
    )


    elements.append(
        Spacer(1, 5 * mm)
    )


    # Certificate Title
    elements.append(
        Paragraph(
            "CERTIFICATE OF COMPLETION",
            title_style
        )
    )


    elements.append(
        Spacer(1, 4 * mm)
    )


    elements.append(
        Paragraph(
            "This certificate is proudly presented to",
            subtitle_style
        )
    )


    elements.append(
        Spacer(1, 3 * mm)
    )


    # Student Name
    elements.append(
        Paragraph(
            student.full_name,
            student_style
        )
    )


    elements.append(
        Spacer(1, 3 * mm)
    )


    elements.append(
        Paragraph(
            "for successfully completing the internship program",
            subtitle_style
        )
    )


    elements.append(
        Spacer(1, 3 * mm)
    )


    # Internship Name
    elements.append(
        Paragraph(
            internship.title,
            internship_style
        )
    )


    elements.append(
        Spacer(1, 4 * mm)
    )


    elements.append(
        Paragraph(
            f"""
            The participant successfully completed the required
            internship tasks and demonstrated satisfactory
            performance throughout the program.
            """,
            subtitle_style
        )
    )


    elements.append(
        Spacer(1, 5 * mm)
    )


    # Certificate Details Table
    details = [

        [
            Paragraph(
                f"""
                <b>Certificate No.</b><br/>
                {certificate_number}
                """,
                detail_style
            ),

            Paragraph(
                f"""
                <b>Issue Date</b><br/>
                {issue_date}
                """,
                detail_style
            ),

            Paragraph(
                f"""
                <b>Completion</b><br/>
                {progress:.0f}%
                """,
                detail_style
            )
        ]

    ]


    details_table = Table(
        details,
        colWidths=[
            65 * mm,
            65 * mm,
            65 * mm
        ]
    )


    details_table.setStyle(

        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                colors.HexColor("#EEF7FC")
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                1,
                colors.HexColor("#CBD5E1")
            ),

            (
                "INNERGRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#CBD5E1")
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                8
            )

        ])

    )


    elements.append(details_table)


    elements.append(
        Spacer(1, 8 * mm)
    )


    # Signature Area
    signature_data = [

        [
            Paragraph(
                "_________________________<br/>Program Coordinator",
                signature_style
            ),

            Paragraph(
                "_________________________<br/>Authorized Signatory",
                signature_style
            )
        ]

    ]


    signature_table = Table(
        signature_data,

        colWidths=[
            100 * mm,
            100 * mm
        ]
    )


    elements.append(signature_table)


    # Build PDF
    doc.build(
        elements,

        onFirstPage=
            draw_certificate_background,

        onLaterPages=
            draw_certificate_background
    )


    # Save Certificate Record
    db_certificate = Certificate(

        student_id=student.id,

        internship_id=internship.id,

        certificate_number=
            certificate_number,

        file_path=filepath
    )


    db.add(db_certificate)

    db.commit()

    db.refresh(db_certificate)


    return {

        "message":
            "Certificate generated successfully",

        "certificate": {

            "id":
                db_certificate.id,

            "certificate_number":
                db_certificate.certificate_number

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
        .filter(
            User.email == user["email"]
        )
        .first()
    )


    certificates = (
        db.query(Certificate)
        .filter(
            Certificate.student_id ==
            student.id
        )
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
        .filter(
            User.email == user["email"]
        )
        .first()
    )


    certificate = (
        db.query(Certificate)
        .filter(
            Certificate.id ==
            certificate_id,

            Certificate.student_id ==
            student.id
        )
        .first()
    )


    if not certificate:

        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )


    if not os.path.exists(
        certificate.file_path
    ):

        raise HTTPException(
            status_code=404,
            detail="Certificate file not found"
        )


    return FileResponse(

        path=certificate.file_path,

        filename=
            f"{certificate.certificate_number}.pdf",

        media_type="application/pdf"
    )