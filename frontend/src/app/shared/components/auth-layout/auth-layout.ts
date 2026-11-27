import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  imports: [MatCardModule],
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

        <ng-content />
      </mat-card>
    </div>
  `,
})
export class AuthLayout {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
