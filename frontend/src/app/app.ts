import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    // Inicjalizujemy sesję (odpytanie /auth/me na starcie aplikacji)
    this.authService.initSession().subscribe();
  }
}
