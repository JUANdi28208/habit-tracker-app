import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { HabitService, Habit } from '../../services/habit.service';
import { StatsService, OverallStats } from '../../services/stats.service';
import { UserStats } from '../../services/achievement.service';
import { GamificationService } from '../../services/gamification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  habits: Habit[] = [];
  stats: OverallStats | null = null;
  userStats: UserStats | null = null;
  loading = true;
  showHabitForm = false;

  constructor(
    private authService: AuthService,
    private habitService: HabitService,
    private statsService: StatsService,
    private gamificationService: GamificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
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
      },
    });

    this.statsService.getOverallStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      },
    });

    this.gamificationService.loadUserStats();
    this.gamificationService.userStats$.subscribe({
      next: (userStats) => {
        this.userStats = userStats;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      },
    });
  }

  toggleHabitForm(): void {
    this.showHabitForm = !this.showHabitForm;
  }

  onHabitCreated(): void {
    this.showHabitForm = false;
    this.loadData();
  }
}
