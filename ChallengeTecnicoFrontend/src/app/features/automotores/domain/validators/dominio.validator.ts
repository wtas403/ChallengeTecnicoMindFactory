const DOMINIO_PATTERNS = [/^[A-Z]{3}\d{3}$/, /^[A-Z]{2}\d{3}[A-Z]{2}$/];

export function normalizeDominio(value: string): string {
  return value.trim().toUpperCase();
}

export function isDominioValid(value: string): boolean {
  const normalizedValue = normalizeDominio(value);
  return DOMINIO_PATTERNS.some((pattern) => pattern.test(normalizedValue));
}
