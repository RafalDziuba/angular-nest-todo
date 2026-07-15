import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';
import { AuthErrorCode } from '../../../core/constants/auth.enums';
import { useCooldown } from '../../../shared/utils/cooldown';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SocialLoginComponent } from '../../../shared/components/social-login/social-login.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    AuthLayoutComponent,
    InputComponent,
    SocialLoginComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEmailNotVerified = signal<boolean>(false);
  protected readonly isResending = signal<boolean>(false);
  protected readonly resendSuccessMessage = signal<string | null>(null);
  protected readonly cooldown = useCooldown();

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isEmailNotVerified.set(false);
    this.resendSuccessMessage.set(null);
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.isLoading.set(false);
      return;
    }

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const message = err?.error?.message || 'Błędny e-mail lub hasło. Spróbuj ponownie.';
        this.errorMessage.set(message);

        if (err?.error?.code === AuthErrorCode.EMAIL_NOT_VERIFIED) {
          this.isEmailNotVerified.set(true);
        }
      }
    });
  }

  protected onResendVerification(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email || this.isResending() || this.cooldown.isActive()) {
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);
    this.resendSuccessMessage.set(null);

    this.authService.resendVerification(email).subscribe({
      next: (response) => {
        this.isResending.set(false);
        this.resendSuccessMessage.set(response.message);
        this.isEmailNotVerified.set(false);
        this.cooldown.start(60);
      },
      error: (err: HttpErrorResponse) => {
        this.isResending.set(false);
        this.errorMessage.set(err?.error?.message);
      }
    });
  }
}
