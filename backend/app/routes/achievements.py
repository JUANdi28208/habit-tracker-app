from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, timedelta
from app.database.database import get_db
from app.models.models import User, Achievement, UserAchievement, Habit, HabitLog, AchievementTypeEnum, CategoryEnum
from app.schemas.schemas import AchievementResponse, UserAchievementResponse, UserStatsResponse, StreakRecoveryRequest, StreakRecoveryResponse
from app.auth.auth import get_current_user

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])

# Initialize default achievements
def initialize_achievements(db: Session):
    """Create default achievements if they don't exist"""
    default_achievements = [
        {
            "name": "Primer Día",
            "description": "Completa tu primer hábito",
            "achievement_type": AchievementTypeEnum.first_day,
            "points_reward": 10,
            "icon": "star",
            "requirement_value": 1
        },
        {
            "name": "Racha de 7 Días",
            "description": "Mantén un hábito durante 7 días consecutivos",
            "achievement_type": AchievementTypeEnum.streak_7,
            "points_reward": 50,
            "icon": "fire",
            "requirement_value": 7
        },
        {
            "name": "Racha de 30 Días",
            "description": "Mantén un hábito durante 30 días consecutivos",
            "achievement_type": AchievementTypeEnum.streak_30,
            "points_reward": 200,
            "icon": "trophy",
            "requirement_value": 30
        },
        {
            "name": "Mes Completo",
            "description": "Completa todos tus hábitos durante un mes entero",
            "achievement_type": AchievementTypeEnum.month_complete,
            "points_reward": 300,
            "icon": "calendar",
            "requirement_value": 30
        },
        {
            "name": "Maestro de Hábitos",
            "description": "Crea y mantén 10 hábitos activos",
            "achievement_type": AchievementTypeEnum.habit_master,
            "points_reward": 150,
            "icon": "crown",
            "requirement_value": 10
        }
    ]
    
    # Add category-specific achievements
    for category in CategoryEnum:
        default_achievements.append({
            "name": f"Experto en {category.value.capitalize()}",
            "description": f"Completa 50 hábitos de {category.value}",
            "achievement_type": AchievementTypeEnum.category_expert,
            "category": category,
            "points_reward": 100,
            "icon": "medal",
            "requirement_value": 50
        })
    
    for achievement_data in default_achievements:
        existing = db.query(Achievement).filter(
            Achievement.achievement_type == achievement_data["achievement_type"],
            Achievement.category == achievement_data.get("category")
        ).first()
        
        if not existing:
            achievement = Achievement(**achievement_data)
            db.add(achievement)
    
    db.commit()

@router.get("/", response_model=List[AchievementResponse])
def get_all_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available achievements"""
    initialize_achievements(db)
    achievements = db.query(Achievement).all()
    return achievements

@router.get("/user", response_model=List[UserAchievementResponse])
def get_user_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get achievements unlocked by the current user"""
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    return user_achievements

@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's points, level, and achievement count"""
    total_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).count()
    
    return UserStatsResponse(
        id=current_user.id,
        username=current_user.username,
        points=current_user.points or 0,
        level=current_user.level or 1,
        total_achievements=total_achievements
    )

@router.post("/check")
def check_and_unlock_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check and unlock achievements based on user's progress"""
    initialize_achievements(db)
    newly_unlocked = []
    
    # Get user's habits and logs
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    
    for habit in habits:
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.completed == True
        ).order_by(HabitLog.date.desc()).all()
        
        if not logs:
            continue
        
        # Check first day achievement
        if len(logs) >= 1:
            achievement = db.query(Achievement).filter(
                Achievement.achievement_type == AchievementTypeEnum.first_day
            ).first()
            
            if achievement:
                existing = db.query(UserAchievement).filter(
                    UserAchievement.user_id == current_user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                
                if not existing:
                    user_achievement = UserAchievement(
                        user_id=current_user.id,
                        achievement_id=achievement.id,
                        progress=100
                    )
                    db.add(user_achievement)
                    current_user.points += achievement.points_reward
                    newly_unlocked.append(achievement.name)
        
        # Calculate current streak
        current_streak = calculate_streak(logs)
        
        # Check streak achievements
        if current_streak >= 7:
            achievement = db.query(Achievement).filter(
                Achievement.achievement_type == AchievementTypeEnum.streak_7
            ).first()
            
            if achievement:
                existing = db.query(UserAchievement).filter(
                    UserAchievement.user_id == current_user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                
                if not existing:
                    user_achievement = UserAchievement(
                        user_id=current_user.id,
                        achievement_id=achievement.id,
                        progress=100
                    )
                    db.add(user_achievement)
                    current_user.points += achievement.points_reward
                    newly_unlocked.append(achievement.name)
        
        if current_streak >= 30:
            achievement = db.query(Achievement).filter(
                Achievement.achievement_type == AchievementTypeEnum.streak_30
            ).first()
            
            if achievement:
                existing = db.query(UserAchievement).filter(
                    UserAchievement.user_id == current_user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                
                if not existing:
                    user_achievement = UserAchievement(
                        user_id=current_user.id,
                        achievement_id=achievement.id,
                        progress=100
                    )
                    db.add(user_achievement)
                    current_user.points += achievement.points_reward
                    newly_unlocked.append(achievement.name)
        
        # Check category expert achievements
        category_logs = db.query(HabitLog).join(Habit).filter(
            Habit.user_id == current_user.id,
            Habit.category == habit.category,
            HabitLog.completed == True
        ).count()
        
        if category_logs >= 50:
            achievement = db.query(Achievement).filter(
                Achievement.achievement_type == AchievementTypeEnum.category_expert,
                Achievement.category == habit.category
            ).first()
            
            if achievement:
                existing = db.query(UserAchievement).filter(
                    UserAchievement.user_id == current_user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                
                if not existing:
                    user_achievement = UserAchievement(
                        user_id=current_user.id,
                        achievement_id=achievement.id,
                        progress=100
                    )
                    db.add(user_achievement)
                    current_user.points += achievement.points_reward
                    newly_unlocked.append(achievement.name)
    
    # Check habit master achievement
    active_habits_count = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).count()
    
    if active_habits_count >= 10:
        achievement = db.query(Achievement).filter(
            Achievement.achievement_type == AchievementTypeEnum.habit_master
        ).first()
        
        if achievement:
            existing = db.query(UserAchievement).filter(
                UserAchievement.user_id == current_user.id,
                UserAchievement.achievement_id == achievement.id
            ).first()
            
            if not existing:
                user_achievement = UserAchievement(
                    user_id=current_user.id,
                    achievement_id=achievement.id,
                    progress=100
                )
                db.add(user_achievement)
                current_user.points += achievement.points_reward
                newly_unlocked.append(achievement.name)
    
    # Update user level based on points
    new_level = (current_user.points // 100) + 1
    if new_level > current_user.level:
        current_user.level = new_level
    
    db.commit()
    
    return {
        "message": "Achievements checked",
        "newly_unlocked": newly_unlocked,
        "current_points": current_user.points,
        "current_level": current_user.level
    }

def calculate_streak(logs: List[HabitLog]) -> int:
    """Calculate current streak from habit logs"""
    if not logs:
        return 0
    
    streak = 0
    current_date = date.today()
    
    # Sort logs by date descending
    sorted_logs = sorted(logs, key=lambda x: x.date, reverse=True)
    
    # Check if there's a log for today or yesterday
    if sorted_logs[0].date < current_date - timedelta(days=1):
        return 0
    
    for i, log in enumerate(sorted_logs):
        expected_date = current_date - timedelta(days=i)
        if log.date == expected_date:
            streak += 1
        else:
            break
    
    return streak

@router.post("/recover-streak", response_model=StreakRecoveryResponse)
def recover_streak(
    recovery_request: StreakRecoveryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Recover a broken streak by spending points or completing a mission"""
    from app.models.models import StreakRecovery
    
    habit = db.query(Habit).filter(
        Habit.id == recovery_request.habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    points_cost = 50
    
    if recovery_request.use_points:
        if current_user.points < points_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough points to recover streak"
            )
        
        current_user.points -= points_cost
    
    # Create recovery record
    recovery = StreakRecovery(
        user_id=current_user.id,
        habit_id=recovery_request.habit_id,
        recovery_date=date.today(),
        points_spent=points_cost if recovery_request.use_points else 0,
        mission_completed=recovery_request.mission_completed
    )
    
    db.add(recovery)
    
    # Add a log entry for yesterday to maintain the streak
    yesterday = date.today() - timedelta(days=1)
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == recovery_request.habit_id,
        HabitLog.date == yesterday
    ).first()
    
    if not existing_log:
        recovery_log = HabitLog(
            habit_id=recovery_request.habit_id,
            date=yesterday,
            completed=True,
            notes="Racha recuperada"
        )
        db.add(recovery_log)
    
    db.commit()
    db.refresh(recovery)
    
    return recovery
