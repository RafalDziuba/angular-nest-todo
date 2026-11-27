import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  type: 'default' | 'success' | 'warning' | 'error';
  hideIcon?: boolean;
}

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.html',
  styleUrl: './custom-snackbar.scss',
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSnackbar {
  readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef<CustomSnackbar>);

  get icon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
