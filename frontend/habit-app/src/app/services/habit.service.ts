import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Habit {
  id?: number;
  name: string;
  description: string;
  category: Category;
  color: string;
  goal_frequency: number;
  is_active: boolean;
  created_at?: string;
}

export enum Category {
  HEALTH = 'health',
  FITNESS = 'fitness', 
  PRODUCTIVITY = 'productivity',
  MINDFULNESS = 'mindfulness',
  LEARNING = 'learning',
  SOCIAL = 'social',
  CREATIVITY = 'creativity',
  OTHER = 'other'
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:8000/api'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  // Métodos CRUD
  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/habits`);
  }

  createHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}/habits`, habit);
  }

  updateHabit(id: number, habit: Habit): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/habits/${id}`, habit);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/habits/${id}`);
  }

  getHabit(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/habits/${id}`);
  }
}