import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Habit } from '../../services/habit.service';

@Component({
  selector: 'app-habit-stats',
  template: '<div class="mt-4"><p class="text-muted">Estadísticas en desarrollo...</p></div>'
})
export class HabitStatsComponent {
  @Input() habit!: Habit;
  @Output() close = new EventEmitter<void>();
}