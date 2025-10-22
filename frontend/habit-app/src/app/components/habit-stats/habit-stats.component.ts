import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Habit } from '../../services/habit.service';
import { StatsService, HabitStats } from '../../services/stats.service';

@Component({
  selector: 'app-habit-stats',
  templateUrl: './habit-stats.component.html',
  styleUrls: ['./habit-stats.component.scss']
})
export class HabitStatsComponent implements OnInit {
  @Input() habit!: Habit;
  @Output() close = new EventEmitter<void>();

  stats: HabitStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    if (this.habit && this.habit.id) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    this.statsService.getHabitStats(this.habit.id!).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.error = 'No se pudieron cargar las estadísticas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  retryLoadStats(): void {
    if (this.habit && this.habit.id) {
      this.loadStats();
    }
  }
}