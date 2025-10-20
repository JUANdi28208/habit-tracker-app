import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OverallStats {
  total_habits: number;
  completed_today: number;
  current_streak: number;
  monthly_completion_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getOverallStats(): Observable<OverallStats> {
    return this.http.get<OverallStats>(`${this.apiUrl}/stats/overview`);
  }
}