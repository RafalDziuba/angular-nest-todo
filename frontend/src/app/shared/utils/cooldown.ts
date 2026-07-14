import { inject, DestroyRef, signal, computed, Signal } from '@angular/core';

export interface Cooldown {
  seconds: Signal<number>;
  start: (seconds: number) => void;
  isActive: Signal<boolean>;
}

export function useCooldown(): Cooldown {
  const seconds = signal<number>(0);
  const isActive = computed(() => seconds() > 0);
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const destroyRef = inject(DestroyRef);

  const start = (startSeconds: number) => {
    seconds.set(startSeconds);
    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
      seconds.update(s => s - 1);
      if (seconds() <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);
  };

  destroyRef.onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    seconds: seconds.asReadonly(),
    start,
    isActive
  };
}
