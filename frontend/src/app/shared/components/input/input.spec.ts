import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { FormInput } from './input';

@Component({
  imports: [ReactiveFormsModule, FormInput],
  template: `
    <form [formGroup]="form">
      <app-input
        [control]="form.controls.password"
        label="Hasło"
        type="password"
      />
      <app-input
        [control]="form.controls.confirmPassword"
        label="Potwierdź hasło"
        type="password"
        parentErrorKey="passwordMismatch"
        [customErrors]="confirmErrors"
      />
    </form>
  `,
})
class TestHost {
  readonly form = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordMatchValidator },
  );

  readonly confirmErrors = {
    passwordMismatch: 'Podane hasła nie są identyczne.',
  };
}

describe('FormInput (Zoneless + computed)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection(), provideAnimationsAsync('noop')],
    }).compileComponents();
  });

  it('should reactively show and clear parent error in zoneless mode when sibling control changes', async () => {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    await fixture.whenStable();

    host.form.controls.password.setValue('Secret1!');
    host.form.controls.confirmPassword.setValue('Other1!');
    host.form.controls.confirmPassword.markAsTouched();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Podane hasła nie są identyczne.');

    // Zmiana sąsiedniej kontrolki password powinna zaktualizować błąd w confirmPassword
    host.form.controls.password.setValue('Other1!');
    await fixture.whenStable();

    expect(el.textContent).not.toContain('Podane hasła nie są identyczne.');
  });
});
