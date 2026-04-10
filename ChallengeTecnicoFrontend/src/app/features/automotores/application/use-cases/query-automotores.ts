import { Automotor } from '../../domain/models/automotor';
import { AutomotoresFilters } from '../../domain/types/automotores-filters';
import { AutomotoresPage } from '../../domain/types/automotores-page';
import { AutomotoresSort } from '../../domain/types/automotores-sort';

function normalizeSearchTerm(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function filterAutomotores(
  automotores: readonly Automotor[],
  filters: AutomotoresFilters,
): readonly Automotor[] {
  const searchTerm = normalizeSearchTerm(filters.searchTerm);

  if (searchTerm.length === 0) {
    return automotores;
  }

  return automotores.filter((automotor) => {
    const dominio = automotor.dominio.toLocaleLowerCase();
    const cuit = automotor.titular.cuit.toLocaleLowerCase();
    return dominio.includes(searchTerm) || cuit.includes(searchTerm);
  });
}

function compareText(
  valueA: string,
  valueB: string,
  direction: AutomotoresSort['direction'],
): number {
  const normalizedA = valueA.toLocaleLowerCase();
  const normalizedB = valueB.toLocaleLowerCase();
  const compareResult = normalizedA.localeCompare(normalizedB, 'es-AR');
  return direction === 'asc' ? compareResult : -compareResult;
}

export function sortAutomotores(
  automotores: readonly Automotor[],
  sort: AutomotoresSort,
): readonly Automotor[] {
  const sorted = [...automotores];

  sorted.sort((a, b) => {
    switch (sort.field) {
      case 'dominio':
        return compareText(a.dominio, b.dominio, sort.direction);
      case 'titular':
        return compareText(a.titular.nombreCompleto, b.titular.nombreCompleto, sort.direction);
      case 'cuit':
        return compareText(a.titular.cuit, b.titular.cuit, sort.direction);
      case 'fechaFabricacion':
        return compareText(a.fechaFabricacion, b.fechaFabricacion, sort.direction);
      default:
        return 0;
    }
  });

  return sorted;
}

export function paginateAutomotores(
  automotores: readonly Automotor[],
  page: AutomotoresPage,
): readonly Automotor[] {
  const safePageSize = Math.max(1, Math.floor(page.pageSize));
  const safePage = Math.max(1, Math.floor(page.page));
  const start = (safePage - 1) * safePageSize;
  return automotores.slice(start, start + safePageSize);
}

export function calculateTotalPages(totalItems: number, pageSize: number): number {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  return Math.max(1, Math.ceil(totalItems / safePageSize));
}
