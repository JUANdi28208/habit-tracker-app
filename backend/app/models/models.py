from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

class CategoryEnum(str, enum.Enum):
    health = "health"
    fitness = "fitness"
    productivity = "productivity"
    mindfulness = "mindfulness"
    learning = "learning"
    social = "social"
    creativity = "creativity"
    other = "other"

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    category = Column(SQLEnum(CategoryEnum), default=CategoryEnum.other)
    color = Column(String(7), default="#10b981")
    goal_frequency = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

class HabitLog(Base):
    __tablename__ = "habit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=True)
    notes = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    habit = relationship("Habit", back_populates="logs")

class AchievementTypeEnum(str, enum.Enum):
    first_day = "first_day"
    streak_7 = "streak_7"
    streak_30 = "streak_30"
    month_complete = "month_complete"
    habit_master = "habit_master"
    category_expert = "category_expert"
    points_milestone = "points_milestone"

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    achievement_type = Column(SQLEnum(AchievementTypeEnum), nullable=False)
    category = Column(SQLEnum(CategoryEnum), nullable=True)  # For category-specific achievements
    points_reward = Column(Integer, default=10)
    icon = Column(String(50), default="trophy")
    requirement_value = Column(Integer, default=1)  # e.g., 7 for streak_7, 30 for streak_30
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Integer, default=0)  # For tracking progress towards achievement
    
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

class StreakRecovery(Base):
    __tablename__ = "streak_recoveries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_id = Column(Integer, ForeignKey("habits.id"))
    recovery_date = Column(Date, nullable=False)
    points_spent = Column(Integer, default=50)  # Cost to recover a streak
    mission_completed = Column(Boolean, default=False)  # Alternative to spending points
    created_at = Column(DateTime, default=datetime.utcnow)
