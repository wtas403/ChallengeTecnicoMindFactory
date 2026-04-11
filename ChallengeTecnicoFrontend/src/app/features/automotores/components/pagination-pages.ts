import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-pages',
  template: `
    <nav
      id="automotores-pagination-pages"
      class="app-pagination-pages-group"
      aria-label="Selector de pagina"
    >
      @for (pageNumber of visiblePages(); track pageNumber) {
        <button
          type="button"
          class="app-pagination-page-button"
          [class.app-pagination-page-button-active]="isCurrentPage(pageNumber)"
          [class.app-pagination-page-button-idle]="!isCurrentPage(pageNumber)"
          (click)="goToPage.emit(pageNumber)"
          [attr.aria-current]="isCurrentPage(pageNumber) ? 'page' : null"
          [attr.aria-label]="pageAriaLabel(pageNumber)"
        >
          {{ pageNumber }}
        </button>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationPagesComponent {
  readonly currentPage = input.required<number>();
  readonly visiblePages = input.required<readonly number[]>();
  readonly goToPage = output<number>();

  isCurrentPage(pageNumber: number): boolean {
    return pageNumber === this.currentPage();
  }

  pageAriaLabel(pageNumber: number): string {
    return this.isCurrentPage(pageNumber)
      ? `Pagina actual, ${pageNumber}`
      : `Ir a la pagina ${pageNumber}`;
  }
}
