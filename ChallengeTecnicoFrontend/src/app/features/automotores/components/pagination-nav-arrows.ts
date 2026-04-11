import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-nav-arrows',
  template: `
    <nav
      id="automotores-pagination-nav-arrows"
      class="app-pagination-arrows-group"
      aria-label="Controles de navegacion"
    >
      @if (position() === 'leading') {
        <button
          id="automotores-page-first"
          type="button"
          class="app-pagination-arrow-button"
          (click)="goFirst.emit()"
          [disabled]="isAtFirstPage()"
          aria-label="Ir a la primera pagina"
        >
          <span aria-hidden="true">«</span>
        </button>

        <button
          id="automotores-page-previous"
          type="button"
          class="app-pagination-arrow-button"
          (click)="goPrevious.emit()"
          [disabled]="isAtFirstPage()"
          aria-label="Ir a la pagina anterior"
        >
          <span aria-hidden="true">‹</span>
        </button>
      } @else {
        <button
          id="automotores-page-next"
          type="button"
          class="app-pagination-arrow-button"
          (click)="goNext.emit()"
          [disabled]="isAtLastPage()"
          aria-label="Ir a la pagina siguiente"
        >
          <span aria-hidden="true">›</span>
        </button>

        <button
          id="automotores-page-last"
          type="button"
          class="app-pagination-arrow-button"
          (click)="goLast.emit()"
          [disabled]="isAtLastPage()"
          aria-label="Ir a la ultima pagina"
        >
          <span aria-hidden="true">»</span>
        </button>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationNavArrowsComponent {
  readonly position = input<'leading' | 'trailing'>('leading');
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly goFirst = output<void>();
  readonly goPrevious = output<void>();
  readonly goNext = output<void>();
  readonly goLast = output<void>();

  readonly isAtFirstPage = computed(() => this.currentPage() <= 1);
  readonly isAtLastPage = computed(() => this.currentPage() >= this.totalPages());
}
