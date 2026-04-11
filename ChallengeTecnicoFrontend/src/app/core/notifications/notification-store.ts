import { Injectable, computed, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error';

export interface AppNotification {
  readonly id: number;
  readonly kind: NotificationKind;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly notificationsState = signal<readonly AppNotification[]>([]);
  private nextId = 1;

  readonly notifications = computed(() => this.notificationsState());

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  dismiss(id: number): void {
    this.notificationsState.update((current) => current.filter((notification) => notification.id !== id));
  }

  private push(kind: NotificationKind, message: string): void {
    const notification: AppNotification = {
      id: this.nextId,
      kind,
      message,
    };

    this.nextId += 1;
    this.notificationsState.update((current) => [...current, notification]);

    globalThis.setTimeout(() => {
      this.dismiss(notification.id);
    }, 5000);
  }
}
