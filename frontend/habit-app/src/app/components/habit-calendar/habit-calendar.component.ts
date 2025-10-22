import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Habit } from '../../services/habit.service';
import { LogService, HabitLog } from '../../services/log.service';
import { StatsService } from '../../services/stats.service';

interface CalendarDay {
  date: Date;
  dateString: string;
  completed: boolean;
  isFuture: boolean;
  logId?: number;
  notes?: string;
}

@Component({
  selector: 'app-habit-calendar',
  templateUrl: './habit-calendar.component.html',
  styleUrls: ['./habit-calendar.component.scss']
})
export class HabitCalendarComponent implements OnInit, OnChanges {
  @Input() habit!: Habit;

  weeks: CalendarDay[][] = [];
  logs: HabitLog[] = [];
  loading = false;
  
  totalCompleted = 0;
  currentStreak = 0;
  completionRate = 0;

  constructor(
    private logService: LogService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    if (this.habit && this.habit.id) {
      this.loadData();
    }
  }

  ngOnChanges(): void {
    if (this.habit && this.habit.id) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    
    // Cargar logs
    this.logService.getHabitLogs(this.habit.id!, 90).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.loading = false;
      }
    });

    // Cargar stats
    this.statsService.getHabitStats(this.habit.id!).subscribe({
      next: (stats) => {
        this.totalCompleted = stats.total_logs;
        this.currentStreak = stats.current_streak;
        this.completionRate = stats.completion_rate;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  generateCalendar(): void {
    const today = new Date();
    const days: CalendarDay[] = [];

    // Generar últimos 90 días
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = this.formatDate(date);
      
      const log = this.logs.find(l => l.date === dateString);
      
      days.push({
        date: date,
        dateString: dateString,
        completed: log ? log.completed : false,
        isFuture: date > today,
        logId: log?.id,
        notes: log?.notes
      });
    }

    // Organizar en semanas (13 semanas = ~90 días / 7)
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getHeatmapClass(day: CalendarDay): string {
    if (day.isFuture) {
      return 'level-future';
    }
    return day.completed ? `level-4 ${this.habit.color}` : 'level-0';
  }

  getTooltip(day: CalendarDay): string {
    const dateStr = day.date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    
    if (day.isFuture) {
      return `${dateStr} - Futuro`;
    }
    
    let tooltip = day.completed ? 
      `${dateStr} - ✓ Completado` : 
      `${dateStr} - No completado`;
    
    if (day.notes) {
      tooltip += `\nNotas: ${day.notes}`;
    }
    
    return tooltip;
  }

  toggleDay(day: CalendarDay): void {
    if (day.isFuture) {
      return; // No permitir marcar días futuros
    }

    this.logService.toggleLog(this.habit.id!, day.dateString).subscribe({
      next: (updatedLog) => {
        day.completed = updatedLog.completed;
        day.notes = updatedLog.notes;
        this.updateStats();
      },
      error: (error) => {
        console.error('Error toggling log:', error);
      }
    });
  }

  updateStats(): void {
    // Recalcular stats localmente
    this.totalCompleted = this.weeks.reduce((total, week) => 
      total + week.filter(day => day.completed && !day.isFuture).length, 0
    );

    // Recargar stats del servidor
    this.statsService.getHabitStats(this.habit.id!).subscribe({
      next: (stats) => {
        this.currentStreak = stats.current_streak;
        this.completionRate = stats.completion_rate;
      }
    });
  }
}