import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Sygnał przechowujący potencjalny błąd logowania z backendu
  protected readonly errorMessage = signal<string | null>(null);

  // Definicja grupy formularza reaktywnego (Reactive Forms) z walidacją
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      return;
    }

    // Wywołanie metody login z serwisu - zwraca ona Observable, do którego musimy się zasubskrybować
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Zalogowano pomyślnie:', response);
        // Pomyślne logowanie - przekierowujemy na stronę docelową (dashboard)
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Błąd logowania:', err);
        // Pobieramy informację o błędzie z odpowiedzi serwera (np. NestJS domyślnie zwraca błąd w polu err.error.message)
        const message = err?.error?.message || 'Błędny e-mail lub hasło. Spróbuj ponownie.';
        this.errorMessage.set(message);
      }
    });
  }
}

