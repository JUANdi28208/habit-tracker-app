from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.schemas.schemas import HabitCreate, HabitUpdate, HabitResponse
from app.models.models import Habit, User
from app.auth.auth import get_current_active_user

router = APIRouter(prefix="/api/habits", tags=["Habits"])

@router.get("/", response_model=List[HabitResponse])
def get_habits(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener todos los hábitos del usuario"""
    query = db.query(Habit).filter(Habit.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Habit.is_active == True)
    
    habits = query.offset(skip).limit(limit).all()
    return habits

@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener un hábito específico"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    return habit

@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crear un nuevo hábito"""
    new_habit = Habit(**habit.dict(), user_id=current_user.id)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Actualizar un hábito existente"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = habit_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(habit, key, value)
    
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Eliminar un hábito"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db.delete(habit)
    db.commit()
    return None