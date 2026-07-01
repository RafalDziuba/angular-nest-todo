import { Component, input, signal } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';

export class ParentErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    if (!control) {
      return false;
    }

    const controlInvalid = control.invalid;
    const parentMismatch = control.parent && control.parent.hasError('passwordMismatch');
    const isConfirmPassword = control.parent && control.parent.get('confirmPassword') === control;

    return !!((controlInvalid || (parentMismatch && isConfirmPassword)) && (control.touched || control.dirty || isSubmitted));
  }
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  control = input.required<FormControl<string | null>>();
  label = input.required<string>();

  type = input<string>('text');
  icon = input<string>('');
  placeholder = input<string>('');
  customErrors = input<Record<string, string>>({});

  protected readonly hidePassword = signal<boolean>(true);
  protected readonly errorStateMatcher = new ParentErrorStateMatcher();

  protected isPassword(): boolean {
    return this.type() === 'password';
  }

  protected getErrorMessage(): string | null {
    const ctrl = this.control();
    if (!ctrl) {
      return null;
    }

    const errors = ctrl.errors;
    const parentErrors = ctrl.parent?.errors;
    const custom = this.customErrors();

    // 1. Sprawdzamy błędy własne
    if (errors && (ctrl.dirty || ctrl.touched)) {
      for (const key of Object.keys(errors)) {
        if (custom && custom[key]) {
          return custom[key];
        }

        switch (key) {
          case 'required':
            return `${this.label()} jest wymagane.`;
          case 'email':
            return 'Niepoprawny format adresu e-mail.';
          case 'minlength':
            return `Wymagane minimum ${errors['minlength'].requiredLength} znaków.`;
          case 'maxlength':
            return `Maksymalna długość to ${errors['maxlength'].requiredLength} znaków.`;
          case 'pattern':
            return 'Niepoprawny format pola.';
        }
      }
    }

    // 2. Sprawdzamy błędy rodzica (FormGroup)
    const isConfirmPassword = ctrl.parent && ctrl.parent.get('confirmPassword') === ctrl;
    if (isConfirmPassword && parentErrors && parentErrors['passwordMismatch'] && (ctrl.dirty || ctrl.touched)) {
      if (custom && custom['passwordMismatch']) {
        return custom['passwordMismatch'];
      }
      return 'Podane hasła nie są identyczne.';
    }

    return null;
  }
}
