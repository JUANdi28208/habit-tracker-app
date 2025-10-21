from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database.database import get_db
from app.schemas.schemas import HabitStats, OverallStats
from app.models.models import Habit, HabitLog, User
from app.auth.auth import get_current_active_user
from app.utils.helpers import calculate_streak, calculate_longest_streak, calculate_completion_rate

router = APIRouter(prefix="/api/stats", tags=["Statistics"])

@router.get("/habit/{habit_id}", response_model=HabitStats)
def get_habit_stats(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener estadísticas de un hábito específico"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Total de logs completados
    total_logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed == True
    ).count()
    
    # Calcular rachas
    current_streak = calculate_streak(habit_id, db)
    longest_streak = calculate_longest_streak(habit_id, db)
    completion_rate = calculate_completion_rate(habit_id, db)
    
    # Último completado
    last_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed == True
    ).order_by(HabitLog.date.desc()).first()
    
    return HabitStats(
        habit_id=habit.id,
        habit_name=habit.name,
        total_logs=total_logs,
        current_streak=current_streak,
        longest_streak=longest_streak,
        completion_rate=completion_rate,
        last_completed=last_log.date if last_log else None
    )

@router.get("/overall", response_model=OverallStats)
def get_overall_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener estadísticas generales de todos los hábitos del usuario"""
    # Total de hábitos
    total_habits = db.query(Habit).filter(Habit.user_id == current_user.id).count()
    
    # Hábitos activos
    active_habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).count()
    
    # Obtener todos los hábitos del usuario
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    
    total_completions = 0
    total_completion_rate = 0.0
    best_streak = 0
    
    for habit in habits:
        # Total de completados
        completions = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.completed == True
        ).count()
        total_completions += completions
        
        # Tasa de cumplimiento
        rate = calculate_completion_rate(habit.id, db)
        total_completion_rate += rate
        
        # Mejor racha
        streak = calculate_longest_streak(habit.id, db)
        if streak > best_streak:
            best_streak = streak
    
    # Promedio de tasa de cumplimiento
    avg_completion = total_completion_rate / len(habits) if habits else 0.0
    
    return OverallStats(
        total_habits=total_habits,
        active_habits=active_habits,
        total_completions=total_completions,
        average_completion_rate=round(avg_completion, 2),
        best_streak=best_streak
    )