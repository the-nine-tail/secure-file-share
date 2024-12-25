from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apis.users import router as users_router
from apis.files import router as files_router
from auth.auth_handler import AuthHandler
from database.init_db import init_db

app = FastAPI()
auth_handler = AuthHandler()

# Initialize database
init_db()

origins = [
    "http://localhost:3000"
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(files_router, dependencies=[Depends(auth_handler.auth_wrapper)])

@app.get("/")
def read_root():
    return {"message": "Welcome to Secure File Sharing!"}
