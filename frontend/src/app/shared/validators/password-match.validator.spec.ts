import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  it('should return null when passwords match', () => {
    const group = new FormGroup(
      {
        password: new FormControl('Secret1!'),
        confirmPassword: new FormControl('Secret1!'),
      },
      { validators: passwordMatchValidator },
    );

    expect(group.errors).toBeNull();
  });

  it('should return passwordMismatch error when passwords differ', () => {
    const group = new FormGroup(
      {
        password: new FormControl('Secret1!'),
        confirmPassword: new FormControl('Different1!'),
      },
      { validators: passwordMatchValidator },
    );

    expect(group.errors).toEqual({ passwordMismatch: true });
  });
});
