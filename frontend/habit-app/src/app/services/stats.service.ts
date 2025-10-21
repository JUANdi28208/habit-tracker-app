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

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl =  `${environment.apiUrl}/api/stats`;

  constructor(private http: HttpClient) {}

  getOverallStats(): Observable<OverallStats> {
    return this.http.get<OverallStats>(`${this.apiUrl}/overall`);
  }
}