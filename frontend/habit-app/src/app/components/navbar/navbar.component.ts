// src/app/components/navbar/navbar.component.ts
import { Component, Input } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() showAchievementsButton = true; // Para ocultarlo en Achievements
  @Input() backButton: boolean = false; // Para mostrar botón "volver"
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToAchievements(): void {
    this.router.navigate(['/achievements']);
  }

  goBack(): void {
    this.router.navigate(['../']);
  }
}
