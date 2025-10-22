import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HabitLog {
  id?: number;
  habit_id: number;
  date: string;
  completed: boolean;
  notes?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/api/logs`;

  constructor(private http: HttpClient) {}

  toggleLog(habitId: number, date: string): Observable<HabitLog> {
    return this.http.post<HabitLog>(`${this.apiUrl}/habits/${habitId}/logs`, {
      date: date,
      completed: true
    });
  }

  getHabitLogs(habitId: number, days: number = 90): Observable<HabitLog[]> {
    return this.http.get<HabitLog[]>(`${this.apiUrl}/habits/${habitId}/logs`, {
      params: { days: days.toString() }
    });
  }

  updateLogNotes(logId: number, notes: string): Observable<HabitLog> {
    return this.http.patch<HabitLog>(`${this.apiUrl}/${logId}`, { notes });
  }
}