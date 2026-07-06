from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import (
    Task,
    Internship,
    Application,
    User,
    TaskSubmission
)
from ..schemas import (
    TaskCreate,
    TaskUpdate,
    TaskSubmissionCreate,
    SubmissionReview
)
from ..auth import (
    admin_required,
    student_required
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create Task
@router.post("/")
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    internship = (
        db.query(Internship)
        .filter(Internship.id == task.internship_id)
        .first()
    )

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    new_task = Task(
        internship_id=task.internship_id,
        title=task.title,
        description=task.description,
        deadline=task.deadline
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": new_task
    }

# Get All Tasks
@router.get("/")
def get_tasks(
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).all()

    result = []

    for task in tasks:

        result.append({

            "id": task.id,

            "title": task.title,

            "description": task.description,

            "deadline": task.deadline,

            "internship": {
                "id": task.internship.id,
                "title": task.internship.title
            }

        })

    return result

# View Task by Internship ID
@router.get("/internship/{internship_id}")
def get_tasks_by_internship(
    internship_id: int,
    db: Session = Depends(get_db)
):

    tasks = (
        db.query(Task)
        .filter(Task.internship_id == internship_id)
        .all()
    )

    return tasks

# Update Task
@router.put("/{task_id}")
def update_task(
    task_id: int,
    updated: TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    update_data = updated.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task": task
    }


# Delete Task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }

#Student View Assigned Tasks
@router.get("/my")
def my_tasks(
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    applications = (
        db.query(Application)
        .filter(
            Application.student_id == student.id,
            Application.status == "Approved"
        )
        .all()
    )

    result = []

    for application in applications:

        tasks = (
            db.query(Task)
            .filter(
                Task.internship_id == application.internship_id
            )
            .all()
        )

        for task in tasks:

            result.append({

                "task_id": task.id,

                "title": task.title,

                "description": task.description,

                "deadline": task.deadline,

                "internship": task.internship.title

            })

    return result

#Student Submit Task
@router.post("/submit")
def submit_task(
    submission: TaskSubmissionCreate,
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    task = (
        db.query(Task)
        .filter(Task.id == submission.task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    existing = (
        db.query(TaskSubmission)
        .filter(
            TaskSubmission.student_id == student.id,
            TaskSubmission.task_id == task.id
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Task already submitted"
        )

    new_submission = TaskSubmission(

        task_id=submission.task_id,

        student_id=student.id,

        github_link=submission.github_link,

        remarks=submission.remarks

    )

    db.add(new_submission)

    db.commit()

    db.refresh(new_submission)

    return {

        "message": "Task submitted successfully",

        "submission": new_submission

    }

#View My Submissions
@router.get("/submissions")
def my_submissions(
    db: Session = Depends(get_db),
    user=Depends(student_required)
):

    student = (
        db.query(User)
        .filter(User.email == user["email"])
        .first()
    )

    submissions = (
        db.query(TaskSubmission)
        .filter(
            TaskSubmission.student_id == student.id
        )
        .all()
    )
 
    result = []

    for submission in submissions:

        result.append({

            "submission_id": submission.id,

            "task_id": submission.task_id,

            "task": submission.task.title,

            "github_link": submission.github_link,

            "remarks": submission.remarks,

            "status": submission.status,

            "marks": submission.marks,

            "feedback": submission.feedback,

            "submitted_at": submission.submitted_at

        })

    return result

#Admin View All Submissions
@router.get("/admin/submissions")
def all_submissions(
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    submissions = db.query(TaskSubmission).all()

    result = []

    for submission in submissions:

        result.append({

            "submission_id": submission.id,

            "student": {

                "id": submission.student.id,

                "name": submission.student.full_name,

                "email": submission.student.email

            },

            "task": {

                "id": submission.task.id,

                "title": submission.task.title

            },

            "github_link": submission.github_link,

            "remarks": submission.remarks,

            "status": submission.status,

            "marks": submission.marks,

            "feedback": submission.feedback,

            "submitted_at": submission.submitted_at

        })

    return result


#Review Submission
@router.put("/review/{submission_id}")
def review_submission(
    submission_id: int,
    review: SubmissionReview,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):

    submission = (
        db.query(TaskSubmission)
        .filter(TaskSubmission.id == submission_id)
        .first()
    )

    if not submission:

        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    submission.status = review.status
    submission.feedback = review.feedback
    submission.marks = review.marks

    db.commit()
    db.refresh(submission)

    return {

        "message": "Submission reviewed successfully",

        "submission": submission

    }