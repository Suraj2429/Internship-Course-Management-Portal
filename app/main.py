from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .database import engine
from .models import Base

from .routers import (
    auth,
    internship,
    application,
    course,
    task,
    dashboard,
    certificate
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Internship & Course Management Portal"
)


# Static files
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)


# HTML templates
templates = Jinja2Templates(
    directory="app/templates"
)


# Register API routers
app.include_router(auth.router)
app.include_router(internship.router)
app.include_router(application.router)
app.include_router(course.router)
app.include_router(task.router)
app.include_router(dashboard.router)
app.include_router(certificate.router)


# Landing page
@app.get("/")
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# Registration page
@app.get("/register")
def register_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="register.html"
    )


# Login page
@app.get("/login")
def login_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )

## Student Dashboard Page
@app.get("/student/dashboard")
def student_dashboard_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="student_dashboard.html"
    )


# Admin Dashboard Page
@app.get("/admin/dashboard")
def admin_dashboard_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="admin_dashboard.html"
    )

# Student Internship Page
@app.get("/student/internships")
def student_internships_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="student_internships.html"
    )

# Student Courses Page
@app.get("/student/courses")
def student_courses_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="student_courses.html"
    )

# Student Tasks Page
@app.get("/student/tasks")
def student_tasks_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="student_tasks.html"
    )

# Admin Internship Management Page
@app.get("/admin/internships")
def admin_internships_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="admin_internships.html"
    )

# Admin Course Management Page
@app.get("/admin/courses")
def admin_courses_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="admin_courses.html"
    )

# Admin Applications Page
@app.get("/admin/applications")
def admin_applications_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="admin_applications.html"
    )

# Admin Task Management Page
@app.get("/admin/tasks")
def admin_tasks_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="admin_tasks.html"
    )