from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine
from app.routes import auth, habits, logs, stats
from app.models import models

import time

app = FastAPI(
    title="Habit Tracker API",
    version="1.0.0",
    description="API for tracking daily habits and building streaks 🌱"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://frontend:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas al iniciar
@app.on_event("startup")
def startup_event():
    max_retries = 5
    retry_count = 0
    while retry_count < max_retries:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully!")
            break
        except Exception as e:
            retry_count += 1
            print(f"Failed to create tables (attempt {retry_count}/{max_retries}): {e}")
            if retry_count < max_retries:
                time.sleep(5)
            else:
                print("Max retries reached. Exiting...")
                raise

# Incluir todas las rutas
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(logs.router)
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Habit Tracker API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "habit-tracker-api"
    }