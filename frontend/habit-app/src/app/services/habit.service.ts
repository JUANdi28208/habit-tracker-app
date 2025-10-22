import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

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
  private apiUrl = `${environment.apiUrl}/api/habits`; 

  constructor(private http: HttpClient) {}

  // Métodos CRUD
  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}`);
  }

  createHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}`, habit);
  }

  updateHabit(id: number, habit: Habit): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${id}`, habit);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getHabit(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${id}`);
  }
}