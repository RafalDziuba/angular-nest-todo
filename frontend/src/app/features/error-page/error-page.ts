import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ErrorViewConfig {
  statusCode: number;
  icon: string;
  title: string;
  description: string;
}

const ERROR_CONFIGS: Record<number, ErrorViewConfig> = {
  401: {
    statusCode: 401,
    icon: 'lock',
    title: 'Sesja wygasła lub brak autoryzacji',
    description: 'Aby uzyskać dostęp do tego zasobu, musisz się ponownie zalogować.',
  },
  403: {
    statusCode: 403,
    icon: 'gpp_bad',
    title: 'Brak uprawnień',
    description: 'Nie masz wystarczających uprawnień do wyświetlenia tej strony.',
  },
  404: {
    statusCode: 404,
    icon: 'search_off',
    title: 'Strona nie została znaleziona',
    description: 'Adres, którego szukasz, nie istnieje lub został przeniesiony.',
  },
  500: {
    statusCode: 500,
    icon: 'cloud_off',
    title: 'Błąd serwera',
    description: 'Wystąpił nieoczekiwany błąd po stronie serwera. Spróbuj ponownie za chwilę.',
  },
};

@Component({
  selector: 'app-error-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  private readonly authService = inject(AuthService);
  private readonly location = inject(Location);

  // Automatycznie bindowane z route data lub queryParams (dzięki withComponentInputBinding)
  readonly code = input<string | number>(500);

  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly view = computed<ErrorViewConfig>(() => {
    const numericCode = Number(this.code());
    return (
      ERROR_CONFIGS[numericCode] ?? {
        statusCode: Number.isNaN(numericCode) ? 500 : numericCode,
        icon: 'error_outline',
        title: 'Wystąpił nieoczekiwany błąd',
        description: 'Coś poszło nie tak. Wróć do poprzedniej strony lub przejdź do panelu głównego.',
      }
    );
  });

  protected goBack(): void {
    this.location.back();
  }
}
