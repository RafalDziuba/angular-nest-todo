import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SocialLoginComponent } from '../../../shared/components/social-login/social-login.component';
import { NAME_REGEX, PASSWORD_REGEX } from '../../../core/constants/auth.constants';
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
    AuthLayoutComponent,
    InputComponent,
    SocialLoginComponent
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly registerForm = this.fb.group({
    firstName: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      Validators.pattern(NAME_REGEX)
    ]],
    lastName: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(NAME_REGEX)
    ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(PASSWORD_REGEX)
    ]],
    confirmPassword: ['', [Validators.required]],
    privacyPolicyAccepted: [false, [Validators.requiredTrue]],
    newsletterAccepted: [false]
  }, { validators: passwordMatchValidator });

  protected readonly passwordErrors = {
    pattern: 'Hasło musi zawierać małą i wielką literę, cyfrę oraz znak specjalny.'
  };

  protected readonly nameErrors = {
    pattern: 'Pole może zawierać tylko litery, spacje, myślniki lub apostrofy.'
  };

  protected onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const {
      firstName,
      lastName,
      email,
      password,
      privacyPolicyAccepted,
      newsletterAccepted
    } = this.registerForm.value;

    if (!firstName || !lastName || !email || !password || privacyPolicyAccepted === undefined) {
      this.isLoading.set(false);
      return;
    }

    this.authService.register({
      email,
      password,
      firstName,
      lastName,
      privacyPolicyAccepted: !!privacyPolicyAccepted,
      newsletterAccepted: !!newsletterAccepted
    }).subscribe({

      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Konto zostało utworzone pomyślnie! Przekierowanie...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const message = err?.error?.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
        this.errorMessage.set(message);
      }
    });
  }

}
