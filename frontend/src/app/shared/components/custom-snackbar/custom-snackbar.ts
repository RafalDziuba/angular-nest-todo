import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface SnackbarData {
  message: string;
  type: 'default' | 'success' | 'warning' | 'error';
  hideIcon?: boolean;
}

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.html',
  styleUrl: './custom-snackbar.scss',
  standalone: true,
  imports: [MatIconModule, MatButtonModule]
})
export class CustomSnackbarComponent {
  readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef<CustomSnackbarComponent>);

  get icon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
