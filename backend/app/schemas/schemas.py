from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

# Enums
class CategoryEnum(str, Enum):
    health = "health"
    fitness = "fitness"
    productivity = "productivity"
    mindfulness = "mindfulness"
    learning = "learning"
    social = "social"
    creativity = "creativity"
    other = "other"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Habit Schemas
class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: CategoryEnum = CategoryEnum.other
    color: str = "#10b981"
    goal_frequency: int = 7
    is_active: bool = True

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[CategoryEnum] = None
    color: Optional[str] = None
    goal_frequency: Optional[int] = None
    is_active: Optional[bool] = None

class HabitResponse(HabitBase):
    id: int
    created_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True

# HabitLog Schemas
class HabitLogBase(BaseModel):
    habit_id: int
    date: date
    completed: bool = True
    notes: Optional[str] = None

class HabitLogCreate(BaseModel):
    date: date
    completed: bool = True
    notes: Optional[str] = None

class HabitLogUpdate(BaseModel):
    completed: Optional[bool] = None
    notes: Optional[str] = None

class HabitLogResponse(HabitLogBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Stats Schemas
class HabitStats(BaseModel):
    habit_id: int
    habit_name: str
    total_logs: int
    current_streak: int
    longest_streak: int
    completion_rate: float
    last_completed: Optional[date] = None

class OverallStats(BaseModel):
    total_habits: int
    active_habits: int
    total_completions: int
    average_completion_rate: float
    best_streak: int

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str