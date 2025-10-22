import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum AchievementType {
  FIRST_DAY = 'first_day',
  STREAK_7 = 'streak_7',
  STREAK_30 = 'streak_30',
  MONTH_COMPLETE = 'month_complete',
  HABIT_MASTER = 'habit_master',
  CATEGORY_EXPERT = 'category_expert',
  POINTS_MILESTONE = 'points_milestone',
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  achievement_type: AchievementType;
  category?: string;
  points_reward: number;
  icon: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;
  unlocked_at: string;
  progress: number;
}

export interface UserStats {
  id: number;
  username: string;
  points: number;
  level: number;
  total_achievements: number;
}

export interface StreakRecoveryRequest {
  habit_id: number;
  use_points: boolean;
  mission_completed: boolean;
}

export interface StreakRecoveryResponse {
  id: number;
  habit_id: number;
  recovery_date: string;
  points_spent: number;
  mission_completed: boolean;
  created_at: string;
}

export interface CheckAchievementsResponse {
  message: string;
  newly_unlocked: string[];
  current_points: number;
  current_level: number;
}

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private apiUrl = `${environment.apiUrl}/api/achievements`;

  constructor(private http: HttpClient) {}

  getAllAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}`);
  }

  getUserAchievements(): Observable<UserAchievement[]> {
    return this.http.get<UserAchievement[]>(`${this.apiUrl}/user`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  checkAndUnlockAchievements(): Observable<CheckAchievementsResponse> {
    return this.http.post<CheckAchievementsResponse>(
      `${this.apiUrl}/check`,
      {}
    );
  }

  recoverStreak(
    request: StreakRecoveryRequest
  ): Observable<StreakRecoveryResponse> {
    return this.http.post<StreakRecoveryResponse>(
      `${this.apiUrl}/recover-streak`,
      request
    );
  }

  getAchievementIcon(icon: string): string {
    const iconMap: { [key: string]: string } = {
      star: '⭐',
      fire: '🔥',
      trophy: '🏆',
      calendar: '📅',
      crown: '👑',
      medal: '🏅',
    };
    return iconMap[icon] || '🎯';
  }

  getLevelTitle(level: number): string {
    if (level < 5) return 'Principiante';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Experto';
    if (level < 30) return 'Maestro';
    if (level < 50) return 'Leyenda';
    return 'Gran Maestro';
  }

  getPointsForNextLevel(currentPoints: number): number {
    const currentLevel = Math.floor(currentPoints / 100) + 1;
    return currentLevel * 100 - currentPoints;
  }

  getMotivationalPhrase(level: number): string {
    const phrases = [
      'Cada día es una nueva oportunidad',
      'La constancia es la clave del éxito',
      'Tus hábitos definen tu futuro',
      'Sigue adelante, lo estás haciendo genial',
      'La disciplina supera la motivación',
      'Pequeños pasos, grandes resultados',
      'Eres más fuerte de lo que crees',
      'El progreso es progreso, sin importar qué tan pequeño',
      'Hoy es el día perfecto para mejorar',
      'Tu único límite eres tú mismo',
    ];
    return phrases[level % phrases.length];
  }
}

















// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

// // Tipos de logros que tenemos, algunos son medio inventados pero bueno
// export enum AchievementType {
//   FIRST_DAY = 'first_day', // primer día usando la app
//   STREAK_7 = 'streak_7', // racha de 7 días
//   STREAK_30 = 'streak_30', // racha de 30 días
//   MONTH_COMPLETE = 'month_complete', // mes completo de hábitos
//   HABIT_MASTER = 'habit_master', // dominar un hábito
//   CATEGORY_EXPERT = 'category_expert', // experto en una categoría de hábitos
//   POINTS_MILESTONE = 'points_milestone', // hito de puntos
// }

// // Interfaz de un logro
// export interface Achievement {
//   id: number;
//   name: string;
//   description: string;
//   achievement_type: AchievementType;
//   category?: string; // opcional, no siempre tiene
//   points_reward: number;
//   icon: string;
//   requirement_value: number; // cuántos días/puntos/etc para desbloquear
//   created_at: string;
// }

// // Un logro ya desbloqueado por el usuario
// export interface UserAchievement {
//   id: number;
//   achievement: Achievement;
//   unlocked_at: string;
//   progress: number; 
// }

// // Stats generales del usuario
// export interface UserStats {
//   id: number;
//   username: string;
//   points: number;
//   level: number;
//   total_achievements: number;
// }

// // Request para recuperar racha (uso de puntos o misión completada)
// export interface StreakRecoveryRequest {
//   habit_id: number;
//   use_points: boolean;
//   mission_completed: boolean;
// }

// // Response de recuperación de racha
// export interface StreakRecoveryResponse {
//   id: number;
//   habit_id: number;
//   recovery_date: string;
//   points_spent: number;
//   mission_completed: boolean;
//   created_at: string;
// }

// // Response cuando checamos logros
// export interface CheckAchievementsResponse {
//   message: string;
//   newly_unlocked: string[]; // nombres de los nuevos logros
//   current_points: number;
//   current_level: number;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AchievementService {
//   // URL base de la API
//   private apiUrl = `${environment.apiUrl}/api/achievements`;

//   constructor(private http: HttpClient) {}

//   // trae todos los logros que existen
//   getAllAchievements(): Observable<Achievement[]> {
//     return this.http.get<Achievement[]>(`${this.apiUrl}`);
//   }

//   // trae los logros del usuario
//   getUserAchievements(): Observable<UserAchievement[]> {
//     return this.http.get<UserAchievement[]>(`${this.apiUrl}/user`);
//   }

//   // trae stats generales del usuario
//   getUserStats(): Observable<UserStats> {
//     return this.http.get<UserStats>(`${this.apiUrl}/stats`);
//   }

//   // logros y desbloquea los que corresponden
//   checkAndUnlockAchievements(): Observable<CheckAchievementsResponse> {
//     return this.http.post<CheckAchievementsResponse>(
//       `${this.apiUrl}/check`,
//       {}
//     );
//   }

//   // recupera una racha usando puntos o completando misión
//   recoverStreak(
//     request: StreakRecoveryRequest
//   ): Observable<StreakRecoveryResponse> {
//     return this.http.post<StreakRecoveryResponse>(
//       `${this.apiUrl}/recover-streak`,
//       request
//     );
//   }

//   // mapea iconos 
//   getAchievementIcon(icon: string): string {
//     const iconMap: { [key: string]: string } = {
//       star: '⭐',
//       fire: '🔥',
//       trophy: '🏆',
//       calendar: '📅',
//       crown: '👑',
//       medal: '🏅',
//     };
//     return iconMap[icon] || '🎯';
//   }

//   // Títulos de niveles
//   getLevelTitle(level: number): string {
//     if (level < 5) return 'Principiante';
//     if (level < 10) return 'Aprendiz';
//     if (level < 20) return 'Experto';
//     if (level < 30) return 'Maestro';
//     if (level < 50) return 'Leyenda';
//     return 'Gran Maestro';
//   }

//   // Calcula puntos faltantes para el siguiente nivel
//   getPointsForNextLevel(currentPoints: number): number {
//     const currentLevel = Math.floor(currentPoints / 100) + 1; 
//     return currentLevel * 100 - currentPoints;
//   }

//   // Frases motivacionales random para cada nivel
//   getMotivationalPhrase(level: number): string {
//     const phrases = [
//       'Cada día es una nueva oportunidad',
//       'La constancia es la clave del éxito',
//       'Tus hábitos definen tu futuro',
//       'Sigue adelante, lo estás haciendo genial',
//       'La disciplina supera la motivación',
//       'Pequeños pasos, grandes resultados',
//       'Eres más fuerte de lo que crees',
//       'El progreso es progreso, sin importar qué tan pequeño',
//       'Hoy es el día perfecto para mejorar',
//       'Tu único límite eres tú mismo',
//     ];
//     return phrases[level % phrases.length]; // uso % para reciclar frases si el nivel es alto
//   }
// }
