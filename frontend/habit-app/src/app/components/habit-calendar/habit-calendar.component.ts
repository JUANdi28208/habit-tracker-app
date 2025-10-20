import { Component, Input } from '@angular/core';
import { Habit } from '../../services/habit.service';

@Component({
  selector: 'app-habit-calendar',
  template: '<div class="mt-4"><p class="text-muted">Calendario en desarrollo...</p></div>'
})
export class HabitCalendarComponent {
  @Input() habit!: Habit;
}