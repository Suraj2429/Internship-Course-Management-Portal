from fastapi import FastAPI

app = FastAPI(
    title="Internship & Course Management Portal"
)

@app.get("/")
def home():
    return {
        "message": "Project Started Successfully"
    }