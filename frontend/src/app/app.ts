import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    // Inicjalizujemy sesję (odpytanie /auth/me na starcie aplikacji)
    this.authService.initSession().subscribe();
  }
}
