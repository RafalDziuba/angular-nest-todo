import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthErrorCode } from '../../../core/constants/auth.enums';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { FormInput } from '../../../shared/components/input/input';
import { SocialLogin } from '../../../shared/components/social-login/social-login';
import { useCooldown } from '../../../shared/utils/cooldown';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    AuthLayout,
    FormInput,
    SocialLogin,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly isEmailNotVerified = signal<boolean>(false);
  protected readonly isResending = signal<boolean>(false);
  protected readonly resendSuccessMessage = signal<string | null>(null);
  protected readonly cooldown = useCooldown();

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.isEmailNotVerified.set(false);
    this.resendSuccessMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService
      .login(email, password)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Zalogowano pomyślnie!');
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: HttpErrorResponse) => {
          const message = err?.error?.message || 'Błędny e-mail lub hasło. Spróbuj ponownie.';
          this.notificationService.showError(message);

          if (err?.error?.code === AuthErrorCode.EMAIL_NOT_VERIFIED) {
            this.isEmailNotVerified.set(true);
          }
        },
      });
  }

  protected onResendVerification(): void {
    const email = this.loginForm.controls.email.getRawValue();
    if (!email || this.isResending() || this.cooldown.isActive()) {
      return;
    }

    this.isResending.set(true);
    this.resendSuccessMessage.set(null);

    this.authService
      .resendVerification(email)
      .pipe(
        finalize(() => this.isResending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.resendSuccessMessage.set(response.message);
          this.notificationService.showSuccess(response.message);
          this.isEmailNotVerified.set(false);
          this.cooldown.start(60);
        },
        error: (err: HttpErrorResponse) => {
          const message = err?.error?.message || 'Wystąpił błąd. Spróbuj ponownie.';
          this.notificationService.showError(message);
        },
      });
  }
}
