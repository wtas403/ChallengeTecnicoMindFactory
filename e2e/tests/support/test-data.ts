export interface AutomotorDraft {
  readonly dominio: string;
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly cuitTitular: string;
}

function checksumDigit(base: string): number {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = base
    .split('')
    .map((digit, index) => Number.parseInt(digit, 10) * weights[index])
    .reduce((acc, value) => acc + value, 0);
  const remainder = 11 - (sum % 11);

  if (remainder === 11) {
    return 0;
  }

  if (remainder === 10) {
    return 9;
  }

  return remainder;
}

export function uniqueDominio(): string {
  const letters = Math.random().toString(36).slice(2, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const digits = `${Date.now()}`.slice(-3);
  const suffix = Math.random().toString(36).slice(2, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  return `${letters}${digits}${suffix}`;
}

export function uniqueValidCuit(): string {
  const middle = `${Date.now()}`.slice(-8);
  const base = `20${middle}`;
  return `${base}${checksumDigit(base)}`;
}

export function buildDraft(overrides: Partial<AutomotorDraft> = {}): AutomotorDraft {
  const dominio = overrides.dominio ?? uniqueDominio();

  return {
    dominio,
    chasis: overrides.chasis ?? `CHS-${dominio}`,
    motor: overrides.motor ?? `MTR-${dominio}`,
    color: overrides.color ?? 'Gris',
    fechaFabricacion: overrides.fechaFabricacion ?? '202401',
    cuitTitular: overrides.cuitTitular ?? '20123456786',
  };
}
