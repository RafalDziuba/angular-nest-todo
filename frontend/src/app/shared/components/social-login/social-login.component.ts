import { Component } from '@angular/core';

@Component({
  selector: 'app-social-login',
  standalone: true,
  template: `
    <div class="auth-social">
      <button type="button" class="btn-social">
        <span class="social-icon google">G</span> Google
      </button>
      <button type="button" class="btn-social">
        <span class="social-icon github">🐱</span> GitHub
      </button>
    </div>
  `
})
export class SocialLoginComponent {}
