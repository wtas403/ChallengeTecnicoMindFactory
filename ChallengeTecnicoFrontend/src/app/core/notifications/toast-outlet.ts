import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NotificationStore } from './notification-store';

@Component({
  selector: 'app-toast-outlet',
  template: `
    @if (notifications().length > 0) {
      <section
        class="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Notificaciones"
        aria-live="polite"
      >
        @for (notification of notifications(); track notification.id) {
          <article
            class="pointer-events-auto ml-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm motion-safe:animate-[fade-up_0.25s_ease-out]"
            [class]="toastClass(notification.kind)"
            [attr.data-kind]="notification.kind"
            role="status"
          >
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1 text-sm font-medium">{{ notification.message }}</div>
              <button
                type="button"
                class="app-icon-button app-icon-button-sm shrink-0"
                aria-label="Cerrar notificacion"
                (click)="dismiss(notification.id)"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </article>
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastOutlet {
  private readonly notificationStore = inject(NotificationStore);

  readonly notifications = computed(() => this.notificationStore.notifications());

  dismiss(id: number): void {
    this.notificationStore.dismiss(id);
  }

  toastClass(kind: 'success' | 'error'): string {
    return kind === 'success'
      ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950'
      : 'border-rose-200 bg-rose-50/95 text-rose-950';
  }
}
