import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Używamy sygnału computed (obliczanego reaktywnie na bazie innego sygnału)
  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.name || user.username || user.email : 'Gość';
  });

  protected readonly userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.email : '';
  });

  protected onLogout(): void {
    this.authService
      .logout()
      .pipe(
        catchError(() => EMPTY),
        finalize(() => this.router.navigate(['/login'])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
