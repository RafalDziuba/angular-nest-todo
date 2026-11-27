import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';

export interface User {
  id?: number | string;
  email: string;
  name?: string;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(email: string, password: string): Observable<User> {
    return this.http.post<{ success: boolean }>('/auth/login', { email, password }).pipe(
      // switchMap pozwala na wykonanie kolejnego zapytania (pobranie profilu)
      // i zwrócenie jego wyniku dalej
      switchMap(() => this.getMe()),
    );
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    privacyPolicyAccepted: boolean;
    newsletterAccepted?: boolean;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/register', data);
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/resend-verification', { email });
  }

  getMe(): Observable<User> {
    return this.http.get<User>('/auth/me').pipe(
      tap((user) => {
        this._currentUser.set(user);
      }),
    );
  }

  private hasCookie(name: string): boolean {
    return this.document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
  }

  initSession(): Observable<User | null> {
    if (!this.hasCookie('is_logged_in')) {
      this._currentUser.set(null);
      return of(null);
    }

    return this.getMe().pipe(
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  clearSession(): void {
    this._currentUser.set(null);
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/auth/logout', {}).pipe(
      finalize(() => {
        this._currentUser.set(null);
      }),
    );
  }
}
