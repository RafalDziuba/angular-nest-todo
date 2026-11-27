import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-social-login',
  styleUrl: './social-login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-social">
      <button type="button" class="btn-social">
        <span class="social-icon google">G</span> Google
      </button>
      <button type="button" class="btn-social">
        <span class="social-icon github">🐱</span> GitHub
      </button>
    </div>
  `,
})
export class SocialLogin {}
