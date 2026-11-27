import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroupDirective, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { merge, switchMap } from 'rxjs';

export class ParentErrorStateMatcher implements ErrorStateMatcher {
  constructor(private readonly getParentErrorKey: () => string | null) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }

    const isSubmitted = !!form?.submitted;
    const parentKey = this.getParentErrorKey();
    const hasParentError = !!(parentKey && control.parent?.hasError(parentKey));

    return (control.invalid || hasParentError) && (control.touched || control.dirty || isSubmitted);
  }
}

@Component({
  selector: 'app-input',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInput {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input.required<string>();

  readonly type = input<string>('text');
  readonly icon = input<string>('');
  readonly placeholder = input<string>('');
  readonly customErrors = input<Record<string, string>>({});
  readonly parentErrorKey = input<string | null>(null);

  protected readonly hidePassword = signal<boolean>(true);
  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly errorStateMatcher = new ParentErrorStateMatcher(() => this.parentErrorKey());

  // Most RxJS -> Signal: konwertujemy zdarzenia FormControl (oraz opcjonalnie rodzica FormGroup)
  // na sygnał, dzięki czemu computed() poniżej reaguje na zmiany również w trybie Zoneless + OnPush.
  private readonly controlEvent = toSignal(
    toObservable(this.control).pipe(
      switchMap((ctrl) => (ctrl.parent ? merge(ctrl.events, ctrl.parent.events) : ctrl.events)),
    ),
  );

  protected readonly errorMessage = computed<string | null>(() => {
    // Odczyt sygnału rejestruje zależność reaktywną w computed()
    this.controlEvent();

    const ctrl = this.control();
    const custom = this.customErrors();
    const parentKey = this.parentErrorKey();
    const isInteracted = ctrl.dirty || ctrl.touched;

    if (!isInteracted) {
      return null;
    }

    // 1. Błędy własne kontrolki
    const errors = ctrl.errors;
    if (errors) {
      for (const key of Object.keys(errors)) {
        if (custom[key]) {
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

    // 2. Generyczny błąd z rodzica (FormGroup), jeśli komponent otrzymał parentErrorKey
    if (parentKey && ctrl.parent?.hasError(parentKey)) {
      return custom[parentKey] ?? 'Niepoprawna wartość pola.';
    }

    return null;
  });
}
