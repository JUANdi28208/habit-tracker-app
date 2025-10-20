import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Habit, HabitService } from '../../services/habit.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent {
  @Input() habits: Habit[] = [];
  @Output() habitsChanged = new EventEmitter<void>();
  
  selectedHabit: Habit | null = null;

  constructor(
    private habitService: HabitService,
    private logService: LogService
  ) {}

  toggleToday(habit: Habit): void {
    const today = new Date().toISOString().split('T')[0];
    this.logService.toggleLog(habit.id!, today).subscribe({
      next: () => {
        this.habitsChanged.emit();
      },
      error: (error) => console.error('Error toggling habit:', error)
    });
  }

  deleteHabit(habitId: number): void {
    if (confirm('¿Estás seguro de eliminar este hábito?')) {
      this.habitService.deleteHabit(habitId).subscribe({
        next: () => this.habitsChanged.emit(),
        error: (error) => console.error('Error deleting habit:', error)
      });
    }
  }

  selectHabit(habit: Habit): void {
    this.selectedHabit = habit;
  }

  getCategoryClass(category: string): string {
    return `category-${category}`;
  }
}