from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine
from app.routes import auth, habits, logs, stats
from app.models import models
import logging
import time

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Habit Tracker API",
    version="1.0.0",
    description="API for tracking daily habits and building streaks 🌱"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            logger.info("Database tables created successfully!")
            break
        except Exception as e:
            retry_count += 1
            logger.error(f"Failed to create tables (attempt {retry_count}/{max_retries}): {str(e)}")
            if retry_count < max_retries:
                time.sleep(5)
            else:
                logger.error("Max retries reached. Exiting...")
                raise

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Outgoing response: Status {response.status_code}")
    return response

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