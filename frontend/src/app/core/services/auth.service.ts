import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';

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

  readonly currentUser = signal<User | null>(null);


  login(email: string, password: string): Observable<User> {
    return this.http.post<{ success: boolean }>('/auth/login', { email, password }).pipe(
      // switchMap pozwala nam na wykonanie kolejnego zapytania (pobranie profilu)
      // i zwrócenie jego wyniku dalej
      switchMap(() => this.getMe())
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
      })
    );
  }

  private hasCookie(name: string): boolean {
    return document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
  }

  initSession(): Observable<User | null> {
    if (!this.hasCookie('is_logged_in')) {
      this.currentUser.set(null);
      return of(null);
    }

    return this.getMe().pipe(
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
      })
    );
  }
}
