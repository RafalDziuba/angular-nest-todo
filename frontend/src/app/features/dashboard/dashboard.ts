import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Używamy sygnału computed (obliczanego reaktywnie na bazie innego sygnału)
  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? (user.name || user.username || user.email) : 'Gość';
  });

  protected readonly userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.email : '';
  });

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // W razie błędu sieci i tak przekierowujemy
        this.router.navigate(['/login']);
      }
    });
  }
}
