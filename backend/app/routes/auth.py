from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import UserCreate, UserResponse, Token, LoginRequest
from app.models.models import User
from app.auth.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_active_user
)
import logging

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo usuario"""
    try:
    # Verificar si el email ya existe
            db_user = db.query(User).filter(User.email == user.email).first()
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Verificar si el username ya existe
            db_user = db.query(User).filter(User.username == user.username).first()
            if db_user:
                raise HTTPException(status_code=400, detail="Username already taken")
            
            # Crear nuevo usuario
            hashed_password = get_password_hash(user.password)
            new_user = User(
                email=user.email,
                username=user.username,
                hashed_password=hashed_password
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
    except Exception as e:
        logging.error(f"Error during registration: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred during registration")

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Iniciar sesión y obtener token JWT"""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Obtener información del usuario actual"""
    return current_user