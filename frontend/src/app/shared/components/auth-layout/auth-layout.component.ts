import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="auth-wrapper">
      <mat-card class="auth-card">
        <div class="auth-header">
          <div class="logo-icon">
            <img src="images/logo.svg" alt="TaskHub Logo" />
          </div>
          <h2>{{ title() }}</h2>
          @if (subtitle()) {
            <p class="subtitle">{{ subtitle() }}</p>
          }
        </div>
        
        <ng-content></ng-content>
      </mat-card>
    </div>
  `
})
export class AuthLayoutComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
