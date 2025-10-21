from datetime import date, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.models import HabitLog

def calculate_streak(habit_id: int, db: Session) -> int:
    """Calcular la racha actual de un hábito"""
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed == True
    ).order_by(HabitLog.date.desc()).all()
    
    if not logs:
        return 0
    
    streak = 0
    current_date = date.today()
    
    # Verificar si completó hoy o ayer
    if logs[0].date == current_date or logs[0].date == current_date - timedelta(days=1):
        streak = 1
        expected_date = logs[0].date - timedelta(days=1)
        
        for i in range(1, len(logs)):
            if logs[i].date == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
    
    return streak

def calculate_longest_streak(habit_id: int, db: Session) -> int:
    """Calcular la racha más larga de un hábito"""
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed == True
    ).order_by(HabitLog.date).all()
    
    if not logs:
        return 0
    
    max_streak = 1
    current_streak = 1
    
    for i in range(1, len(logs)):
        if (logs[i].date - logs[i-1].date).days == 1:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 1
    
    return max_streak

def calculate_completion_rate(habit_id: int, db: Session, days: int = 30) -> float:
    """Calcular tasa de cumplimiento para los últimos N días"""
    start_date = date.today() - timedelta(days=days)
    
    completed_logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date >= start_date,
        HabitLog.completed == True
    ).count()
    
    if days == 0:
        return 0.0
    
    return round((completed_logs / days) * 100, 2)