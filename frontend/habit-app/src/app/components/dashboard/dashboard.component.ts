import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { HabitService, Habit } from '../../services/habit.service';
import { StatsService, OverallStats } from '../../services/stats.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  habits: Habit[] = [];
  stats: OverallStats | null = null;
  loading = true;
  showHabitForm = false;

  constructor(
    private authService: AuthService,
    private habitService: HabitService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.habitService.getHabits().subscribe({
      next: (habits) => {
        this.habits = habits;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading habits:', error);
        this.loading = false;
      }
    });

    this.statsService.getOverallStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  toggleHabitForm(): void {
    this.showHabitForm = !this.showHabitForm;
  }

  onHabitCreated(): void {
    this.showHabitForm = false;
    this.loadData();
  }

  logout(): void {
    this.authService.logout();
  }
}