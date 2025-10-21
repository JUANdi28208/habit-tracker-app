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
    
    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")

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