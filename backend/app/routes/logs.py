from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database.database import get_db
from app.schemas.schemas import HabitLogCreate, HabitLogUpdate, HabitLogResponse
from app.models.models import HabitLog, Habit, User
from app.auth.auth import get_current_active_user

router = APIRouter(prefix="/api/logs", tags=["Habit Logs"])

@router.get("/habit/{habit_id}", response_model=List[HabitLogResponse])
def get_habit_logs(
    habit_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verificar que el hábito pertenece al usuario
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    start_date = date.today() - timedelta(days=days)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date >= start_date
    ).order_by(HabitLog.date.desc()).all()
    return logs

@router.post("/habit/{habit_id}", response_model=HabitLogResponse, status_code=status.HTTP_201_CREATED)
def create_habit_log(
    habit_id: int,
    log: HabitLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verificar que el hábito pertenece al usuario
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Verificar si ya existe un log para esa fecha
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date == log.date
    ).first()
    
    if existing_log:
        raise HTTPException(status_code=400, detail="Log already exists for this date")
    
    new_log = HabitLog(habit_id=habit_id, **log.dict())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.put("/{log_id}", response_model=HabitLogResponse)
def update_habit_log(
    log_id: int,
    log_update: HabitLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    log = db.query(HabitLog).join(Habit).filter(
        HabitLog.id == log_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    update_data = log_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)
    
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    log = db.query(HabitLog).join(Habit).filter(
        HabitLog.id == log_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return None

@router.post("/habit/{habit_id}/toggle/{log_date}", response_model=HabitLogResponse)
def toggle_habit_log(
    habit_id: int,
    log_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Toggle completion status for a specific date"""
    # Verificar que el hábito pertenece al usuario
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Buscar log existente
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date == log_date
    ).first()
    
    if existing_log:
        # Si existe, cambiar el estado
        existing_log.completed = not existing_log.completed
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        # Si no existe, crear uno nuevo como completado
        new_log = HabitLog(
            habit_id=habit_id,
            date=log_date,
            completed=True
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log