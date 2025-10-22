import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OverallStats {
  total_habits: number;
  active_habits: number;
  total_completions: number;
  average_completion_rate: number;
  best_streak: number;
}

export interface HabitStats {
  total_logs: number;
  completed_logs: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${environment.apiUrl}/api/stats`;

  constructor(private http: HttpClient) {}

  getOverallStats(): Observable<OverallStats> {
    return this.http.get<OverallStats>(`${this.apiUrl}/overall`);
  }

  getHabitStats(habitId: number): Observable<HabitStats> {
    return this.http.get<HabitStats>(`${this.apiUrl}/habits/${habitId}`);
  }
}