# 🚀 CareerHub - Internship & Course Management Portal

CareerHub is a modern Internship & Course Management Portal developed using **FastAPI**, **SQLAlchemy**, **SQLite/PostgreSQL**, **Jinja2**, and **Bootstrap**.

The portal allows students to apply for internships, enroll in courses, submit assigned tasks, and download completion certificates, while administrators can manage internships, courses, applications, task reviews, and certificates through a centralized dashboard.

---

## ✨ Features

### Authentication
- User Registration
- Secure Login (JWT Authentication)
- Role-Based Access (Admin & Student)

### Internship Management
- Create Internship
- Update Internship
- Delete Internship
- View Internships
- Apply for Internship
- Approve/Reject Applications

### Course Management
- Create Course
- Update Course
- Delete Course
- Course Enrollment
- View Enrolled Courses

### Task Management
- Create Internship Tasks
- Assign Tasks
- Submit GitHub Links
- Review Submissions
- Marks & Feedback

### Certificate Module
- Generate Internship Certificate
- Download PDF Certificate
- Eligibility Check (80% Approved Tasks)

### Dashboards
- Admin Dashboard
- Student Dashboard
- Statistics
- Pending Applications
- Pending Reviews

---

# 🛠 Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- JWT Authentication
- ReportLab

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript

### Database
- SQLite (Local Development)
- PostgreSQL (Production)

---

# 📂 Project Structure

```
app/
│
├── routers/
├── templates/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── models.py
├── schemas.py
├── auth.py
├── database.py
└── main.py

certificates/
requirements.txt
README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Suraj2429/Internship-Course-Management-Portal.git

cd Internship-Course-Management-Portal
```

## Create Virtual Environment

```bash
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux / Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Application

```bash
uvicorn app.main:app --reload
```

Application will be available at

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# 🔐 Default Admin Credentials

Email

```
admin@career.com
```

Password

```
admin123
```

---

# 🌐 Live Demo

https://internship-course-management-portal.onrender.com

---

# 📷 Screenshots

You can add screenshots here.

Example:

- Home Page
- Login Page
- Admin Dashboard
- Student Dashboard
- Certificate
- Swagger API

---

# 📄 License

This project is developed for learning and internship purposes.

---

# 👨‍💻 Developer

**Suraj Patil**

GitHub

https://github.com/Suraj2429

LinkedIn

https://www.linkedin.com/in/suraj-patil90/
