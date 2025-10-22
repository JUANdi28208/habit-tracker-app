import { Component, OnInit } from '@angular/core';
import {
  AchievementService,
  Achievement,
  UserAchievement,
  UserStats,
} from '../../services/achievement.service';
import { GamificationService } from '../../services/gamification.service';
//importacion de la locacion
import { Location } from '@angular/common';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit {
  allAchievements: Achievement[] = [];
  userAchievements: UserAchievement[] = [];
  userStats: UserStats | null = null;
  loading = true;
  selectedTab: 'unlocked' | 'all' = 'unlocked';
  levelProgress = 0;
  pointsForNextLevel = 0;
  motivationalPhrase = '';

  constructor(
    private achievementService: AchievementService,
    private gamificationService: GamificationService,
    private location: Location //inyectamos la locacion
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.achievementService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.levelProgress = this.gamificationService.calculateProgress(
          stats.points
        );
        this.pointsForNextLevel =
          this.gamificationService.getPointsNeededForNextLevel(stats.points);
        this.motivationalPhrase = this.achievementService.getMotivationalPhrase(
          stats.level
        );
      },
      error: (error) => console.error('Error loading user stats:', error),
    });

    this.achievementService.getAllAchievements().subscribe({
      next: (achievements) => {
        this.allAchievements = achievements;
      },
      error: (error) => console.error('Error loading achievements:', error),
    });

    this.achievementService.getUserAchievements().subscribe({
      next: (userAchievements) => {
        this.userAchievements = userAchievements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user achievements:', error);
        this.loading = false;
      },
    });
  }

  goBack(): void {
    //Navega a la página anterior en el historial
    this.location.back(); 
  }

  checkAchievements(): void {
    this.achievementService.checkAndUnlockAchievements().subscribe({
      next: (response) => {
        if (response.newly_unlocked.length > 0) {
          alert(`¡Logros desbloqueados! ${response.newly_unlocked.join(', ')}`);
        } else {
          alert(
            'No hay nuevos logros por el momento. ¡Sigue trabajando en tus hábitos!'
          );
        }
        this.loadData();
      },
      error: (error) => console.error('Error checking achievements:', error),
    });
  }

  isAchievementUnlocked(achievementId: number): boolean {
    return this.userAchievements.some(
      (ua) => ua.achievement.id === achievementId
    );
  }

  getAchievementIcon(icon: string): string {
    return this.achievementService.getAchievementIcon(icon);
  }

  getLevelTitle(): string {
    return this.userStats
      ? this.achievementService.getLevelTitle(this.userStats.level)
      : '';
  }

  selectTab(tab: 'unlocked' | 'all'): void {
    this.selectedTab = tab;
  }

  getUnlockedDate(achievementId: number): string {
    const userAchievement = this.userAchievements.find(
      (ua) => ua.achievement.id === achievementId
    );
    if (userAchievement) {
      return new Date(userAchievement.unlocked_at).toLocaleDateString();
    }
    return '';
  }
}
