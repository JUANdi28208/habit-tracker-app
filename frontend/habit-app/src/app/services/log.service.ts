import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Log {
  id?: number;
  habit_id: number;
  logged_date: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl =  `${environment.apiUrl}/api/logs `;

  constructor(private http: HttpClient) {}

  toggleLog(habitId: number, date: string): Observable<Log> {
    return this.http.post<Log>(`${this.apiUrl}/habits/${habitId}/logs`, {
      logged_date: date,
      completed: true
    });
  }

  getHabitLogs(habitId: number): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/habits/${habitId}/logs`);
  }
}