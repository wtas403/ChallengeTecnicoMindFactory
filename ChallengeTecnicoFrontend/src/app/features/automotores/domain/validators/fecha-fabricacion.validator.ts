export function isFechaFabricacionValid(value: string, today: Date = new Date()): boolean {
  const normalizedValue = value.trim();

  if (!/^\d{6}$/.test(normalizedValue)) {
    return false;
  }

  const year = Number(normalizedValue.slice(0, 4));
  const month = Number(normalizedValue.slice(4, 6));

  if (month < 1 || month > 12) {
    return false;
  }

  const candidateYearMonth = year * 100 + month;
  const currentYearMonth = today.getFullYear() * 100 + (today.getMonth() + 1);

  return candidateYearMonth <= currentYearMonth;
}
