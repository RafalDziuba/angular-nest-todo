import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { useCooldown } from '../../../shared/utils/cooldown';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-resend-verification',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AuthLayoutComponent,
    InputComponent
  ],
  templateUrl: './resend-verification.html',
  styleUrl: '../login/login.scss'
})
export class ResendVerification {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly cooldown = useCooldown();

  protected readonly resendForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected onSubmit(): void {
    if (this.resendForm.invalid || this.isLoading() || this.cooldown.isActive()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const email = this.resendForm.get('email')?.value;

    if (!email) {
      this.isLoading.set(false);
      return;
    }

    this.authService.resendVerification(email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
        this.cooldown.start(60);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message);
      }
    });
  }
}
