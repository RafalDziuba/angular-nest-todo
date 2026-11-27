import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { FormInput } from '../../../shared/components/input/input';
import { useCooldown } from '../../../shared/utils/cooldown';

@Component({
  selector: 'app-resend-verification',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AuthLayout,
    FormInput,
  ],
  templateUrl: './resend-verification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResendVerification {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly cooldown = useCooldown();

  protected readonly resendForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.resendForm.invalid || this.isLoading() || this.cooldown.isActive()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email } = this.resendForm.getRawValue();

    this.authService
      .resendVerification(email)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.notificationService.showSuccess(response.message);
          this.cooldown.start(60);
        },
        error: (err: HttpErrorResponse) => {
          const message = err?.error?.message || 'Wystąpił błąd. Spróbuj ponownie.';
          this.errorMessage.set(message);
          this.notificationService.showError(message);
        },
      });
  }
}
