import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent, SnackbarData } from '../../shared/components/custom-snackbar/custom-snackbar';

export interface NotificationOptions {
  duration?: number;
  hideIcon?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom'
  };

  private show(message: string, type: SnackbarData['type'], options?: NotificationOptions): void {
    const config: MatSnackBarConfig<SnackbarData> = {
      ...this.defaultConfig,
      duration: options?.duration ?? this.defaultConfig.duration,
      panelClass: ['custom-snackbar-container', `snackbar-${type}`],
      data: {
        message,
        type,
        hideIcon: options?.hideIcon
      }
    };

    this.snackBar.openFromComponent(CustomSnackbarComponent, config);
  }

  showDefault(message: string, options?: NotificationOptions): void {
    this.show(message, 'default', options);
  }

  showSuccess(message: string, options?: NotificationOptions): void {
    this.show(message, 'success', options);
  }

  showWarning(message: string, options?: NotificationOptions): void {
    this.show(message, 'warning', options);
  }

  showError(message: string, options?: NotificationOptions): void {
    this.show(message, 'error', options);
  }
}
