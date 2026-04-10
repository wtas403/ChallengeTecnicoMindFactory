const CUIT_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

export function normalizeCuit(value: string): string {
  return value.replace(/\D/g, '');
}

function calculateCheckDigit(firstTenDigits: string): number {
  const weightedSum = firstTenDigits
    .split('')
    .reduce((sum, digit, index) => sum + Number(digit) * CUIT_WEIGHTS[index], 0);
  const remainder = weightedSum % 11;
  const rawCheckDigit = 11 - remainder;

  if (rawCheckDigit === 11) {
    return 0;
  }

  if (rawCheckDigit === 10) {
    return 9;
  }

  return rawCheckDigit;
}

export function isCuitValid(value: string): boolean {
  const normalizedCuit = normalizeCuit(value);

  if (normalizedCuit.length !== 11) {
    return false;
  }

  const firstTenDigits = normalizedCuit.slice(0, 10);
  const expectedCheckDigit = calculateCheckDigit(firstTenDigits);
  const actualCheckDigit = Number(normalizedCuit.at(-1));

  return actualCheckDigit === expectedCheckDigit;
}
