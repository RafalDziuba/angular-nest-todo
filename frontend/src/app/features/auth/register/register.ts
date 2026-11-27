import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap, tap, timer } from 'rxjs';
import { NAME_REGEX, PASSWORD_REGEX } from '../../../core/constants/auth.constants';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { FormInput } from '../../../shared/components/input/input';
import { SocialLogin } from '../../../shared/components/social-login/social-login';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly registerForm = this.fb.group(
    {
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(NAME_REGEX),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(NAME_REGEX),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(PASSWORD_REGEX)],
      ],
      confirmPassword: ['', [Validators.required]],
      privacyPolicyAccepted: [false, [Validators.requiredTrue]],
      newsletterAccepted: [false],
    },
    { validators: passwordMatchValidator },
  );

  protected readonly passwordErrors = {
    pattern: 'Hasło musi zawierać małą i wielką literę, cyfrę oraz znak specjalny.',
  };

  protected readonly confirmPasswordErrors = {
    passwordMismatch: 'Podane hasła nie są identyczne.',
  };

  protected readonly nameErrors = {
    pattern: 'Pole może zawierać tylko litery, spacje, myślniki lub apostrofy.',
  };

  protected onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { firstName, lastName, email, password, privacyPolicyAccepted, newsletterAccepted } =
      this.registerForm.getRawValue();

    this.authService
      .register({
        email,
        password,
        firstName,
        lastName,
        privacyPolicyAccepted,
        newsletterAccepted,
      })
      .pipe(
        tap((res) => {
          const msg = res.message || 'Konto zostało utworzone pomyślnie! Przekierowanie...';
          this.successMessage.set(msg);
          this.notificationService.showSuccess(msg);
        }),
        finalize(() => this.isLoading.set(false)),
        switchMap(() => timer(1500)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err?.error?.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
          this.errorMessage.set(message);
          this.notificationService.showError(message);
        },
      });
  }
}
