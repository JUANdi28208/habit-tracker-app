import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { AchievementService, UserStats } from "./achievement.service"

export type { UserStats }

@Injectable({
  providedIn: "root",
})
export class GamificationService {
  private userStatsSubject = new BehaviorSubject<UserStats | null>(null)
  public userStats$: Observable<UserStats | null> = this.userStatsSubject.asObservable()

  constructor(private achievementService: AchievementService) {}

  loadUserStats(): void {
    this.achievementService.getUserStats().subscribe({
      next: (stats) => {
        this.userStatsSubject.next(stats)
      },
      error: (error) => {
        console.error("Error loading user stats:", error)
      },
    })
  }

  refreshStats(): void {
    this.loadUserStats()
  }

  getCurrentStats(): UserStats | null {
    return this.userStatsSubject.value
  }

  calculateProgress(currentPoints: number): number {
    const currentLevel = Math.floor(currentPoints / 100)
    const pointsInCurrentLevel = currentPoints - currentLevel * 100
    return (pointsInCurrentLevel / 100) * 100
  }

  getPointsNeededForNextLevel(currentPoints: number): number {
    const currentLevel = Math.floor(currentPoints / 100)
    const nextLevelPoints = (currentLevel + 1) * 100
    return nextLevelPoints - currentPoints
  }

  addPoints(points: number): void {
    const currentStats = this.userStatsSubject.value
    if (currentStats) {
      const newPoints = currentStats.points + points
      const newLevel = Math.floor(newPoints / 100) + 1

      this.userStatsSubject.next({
        ...currentStats,
        points: newPoints,
        level: newLevel,
      })
    }
  }

  showLevelUpNotification(newLevel: number): void {
    // This can be implemented with a toast/notification service
    console.log(`¡Felicidades! Has alcanzado el nivel ${newLevel}`)
  }

  showAchievementUnlockedNotification(achievementName: string): void {
    // This can be implemented with a toast/notification service
    console.log(`¡Logro desbloqueado! ${achievementName}`)
  }
}




// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { AchievementService, UserStats } from './achievement.service';

// // Exportamos el tipo UserStats para que otros módulos puedan usarlo
// export type { UserStats };

// @Injectable({
//   providedIn: 'root',
// })
// export class GamificationService {
//   // BehaviorSubject para mantener el estado actual de los stats del usuario
//   private userStatsSubject = new BehaviorSubject<UserStats | null>(null);

//   // Observable público que expone los stats del usuario
//   public userStats$: Observable<UserStats | null> =
//     this.userStatsSubject.asObservable();

//   constructor(private achievementService: AchievementService) {}

//   // Carga los stats del usuario desde el backend y actualiza el BehaviorSubject
//   loadUserStats(): void {
//     this.achievementService.getUserStats().subscribe({
//       next: (stats) => {
//         this.userStatsSubject.next(stats);
//       },
//       error: (error) => {
//         console.error('Error loading user stats:', error);
//       },
//     });
//   }

//   // Método para refrescar los stats, básicamente vuelve a llamar a loadUserStats
//   refreshStats(): void {
//     this.loadUserStats();
//   }

//   // Devuelve los stats actuales de forma sincrónica
//   getCurrentStats(): UserStats | null {
//     return this.userStatsSubject.value;
//   }

//   // Calcula el porcentaje de progreso dentro del nivel actual
//   calculateProgress(currentPoints: number): number {
//     const currentLevel = Math.floor(currentPoints / 100);
//     const pointsInCurrentLevel = currentPoints - currentLevel * 100;
//     return (pointsInCurrentLevel / 100) * 100;
//   }

//   // Calcula los puntos que faltan para alcanzar el siguiente nivel
//   getPointsNeededForNextLevel(currentPoints: number): number {
//     const currentLevel = Math.floor(currentPoints / 100);
//     const nextLevelPoints = (currentLevel + 1) * 100;
//     return nextLevelPoints - currentPoints;
//   }

//   // Suma puntos al usuario y recalcula su nivel
//   addPoints(points: number): void {
//     const currentStats = this.userStatsSubject.value;
//     if (currentStats) {
//       const newPoints = currentStats.points + points;
//       const newLevel = Math.floor(newPoints / 100) + 1;

//       // Actualiza el estado reactivo con los nuevos stats
//       this.userStatsSubject.next({
//         ...currentStats,
//         points: newPoints,
//         level: newLevel,
//       });
//     }
//   }

//   // Muestra notificación cuando se sube de nivel
//   showLevelUpNotification(newLevel: number): void {
//     console.log(`¡Felicidades! Has alcanzado el nivel ${newLevel}`);
//   }

//   // Muestra notificación cuando se desbloquea un logro
//   showAchievementUnlockedNotification(achievementName: string): void {
//     console.log(`¡Logro desbloqueado! ${achievementName}`);
//   }
// }

