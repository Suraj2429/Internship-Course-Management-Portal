from fastapi import FastAPI, HTTPException
from fastapi import Depends
from .database import engine
from .models import Base
from .routers import auth, internship, application
from .auth import (get_current_user, 
                   admin_required, 
                   student_required)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Internship & Course Management Portal"
)

app.include_router(auth.router)
app.include_router(internship.router)
app.include_router(application.router)
@app.get("/")
def home():

    return {
        "message": "Portal Running Successfully"
    }

@app.get("/profile")
def profile(
    user = Depends(get_current_user)
):

    return {
        "message": "Current Logged In User",
        "user": user
    }

@app.get("/student/dashboard")
def student_dashboard(
    user=Depends(student_required)
):

    return {

        "message":"Welcome Student",

        "student":user
    }

@app.get("/admin/dashboard")
def admin_dashboard(
    user=Depends(admin_required)
):

    return {

        "message":"Welcome Admin",

        "admin":user
    }

