import { Component, Output, EventEmitter } from '@angular/core';
import { HabitService, Habit, Category } from '../../services/habit.service';

@Component({
  selector: 'app-habit-form',
  templateUrl: './habit-form.component.html',
  styleUrls: ['./habit-form.component.scss']
})
export class HabitFormComponent {
  @Output() habitCreated = new EventEmitter<void>();

  habit: Partial<Habit> = {
    name: '',
    description: '',
    category: Category.OTHER,
    color: '#10b981',
    goal_frequency: 7,
    is_active: true
  };

  categories = [
    { value: Category.HEALTH, label: '💚 Salud', color: '#10b981' },
    { value: Category.FITNESS, label: '💪 Fitness', color: '#3b82f6' },
    { value: Category.PRODUCTIVITY, label: '⚡ Productividad', color: '#f59e0b' },
    { value: Category.MINDFULNESS, label: '🧘 Mindfulness', color: '#8b5cf6' },
    { value: Category.LEARNING, label: '📚 Aprendizaje', color: '#ec4899' },
    { value: Category.SOCIAL, label: '👥 Social', color: '#f97316' },
    { value: Category.CREATIVITY, label: '🎨 Creatividad', color: '#6366f1' },
    { value: Category.OTHER, label: '⭐ Otro', color: '#6b7280' }
  ];

  colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
    '#ec4899', '#f97316', '#6366f1', '#ef4444'
  ];

  loading = false;
  errorMessage = '';

  constructor(private habitService: HabitService) {}

  onCategoryChange(): void {
    const selected = this.categories.find(c => c.value === this.habit.category);
    if (selected) {
      this.habit.color = selected.color;
    }
  }

  onSubmit(): void {
    if (!this.habit.name?.trim()) {
      this.errorMessage = 'El nombre del hábito es requerido';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.habitService.createHabit(this.habit as Habit).subscribe({
      next: () => {
        this.habitCreated.emit();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error.detail || 'Error al crear hábito';
      }
    });
  }

  resetForm(): void {
    this.habit = {
      name: '',
      description: '',
      category: Category.OTHER,
      color: '#10b981',
      goal_frequency: 7,
      is_active: true
    };
    this.loading = false;
  }
}