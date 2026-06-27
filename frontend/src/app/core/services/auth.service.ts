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

  // W sygnale przechowujemy dane zalogowanego użytkownika
  readonly currentUser = signal<User | null>(null);

  /**
   * Wysyła dane logowania, a po sukcesie wywołuje /auth/me, aby pobrać i zapisać profil użytkownika.
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<{ success: boolean }>('/auth/login', { email, password }).pipe(
      // switchMap pozwala nam na wykonanie kolejnego zapytania (pobranie profilu)
      // i zwrócenie jego wyniku dalej
      switchMap(() => this.getMe())
    );
  }

  /**
   * Pobiera profil zalogowanego użytkownika z chronionego endpointu /auth/me
   */
  getMe(): Observable<User> {
    return this.http.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Inicjalizuje sesję przy starcie aplikacji (pobiera me, a w razie błędu czyści sygnał)
   */
  initSession(): Observable<User | null> {
    return this.getMe().pipe(
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  /**
   * Wysyła żądanie wylogowania do backendu w celu wyczyszczenia ciasteczka HttpOnly
   */
  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
      })
    );
  }
}
