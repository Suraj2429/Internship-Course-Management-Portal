from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Internship
from ..schemas import InternshipCreate, InternshipUpdate
from ..auth import admin_required

router = APIRouter(
    prefix="/internships",
    tags=["Internships"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Create Internship
@router.post("/")
def create_internship(
    internship: InternshipCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    new_internship = Internship(
        title=internship.title,
        description=internship.description,
        duration=internship.duration,
        vacancies=internship.vacancies
    )

    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)

    return {
        "message": "Internship created successfully",
        "data": new_internship
    }

#Get All Internships
@router.get("/")
def get_all_internships(
    db: Session = Depends(get_db)
):

    internships = db.query(Internship).all()

    return internships

#Get Internship by ID
@router.get("/{internship_id}")
def get_internship(
    internship_id: int,
    db: Session = Depends(get_db)
):

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

    return internship

#Update Internship
@router.put("/{internship_id}")
def update_internship(
    internship_id: int,
    internship: InternshipUpdate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    db_internship = (
        db.query(Internship)
        .filter(Internship.id == internship_id)
        .first()
    )

    if not db_internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    update_data = internship.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_internship, key, value)

    db.commit()
    db.refresh(db_internship)

    return {
        "message": "Internship updated successfully",
        "data": db_internship
    }

#Delete Internship
@router.delete("/{internship_id}")
def delete_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

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

    db.delete(internship)
    db.commit()

    return {
        "message": "Internship deleted successfully"
    }