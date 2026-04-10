export function buildSujeto(overrides: Partial<{ id: number; cuit: string; nombreCompleto: string }> = {}) {
  return {
    id: overrides.id ?? 1,
    cuit: overrides.cuit ?? '20123456786',
    nombreCompleto: overrides.nombreCompleto ?? 'Juan Perez',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
}

export function buildAutomotor(
  overrides: Partial<{
    id: number;
    dominio: string;
    chasis: string;
    motor: string;
    color: string;
    fechaFabricacion: string;
    sujetoId: number;
  }> = {},
) {
  return {
    id: overrides.id ?? 1,
    dominio: overrides.dominio ?? 'AA123BB',
    chasis: overrides.chasis ?? 'CHS-0001',
    motor: overrides.motor ?? 'MTR-0001',
    color: overrides.color ?? 'Rojo',
    fechaFabricacion: overrides.fechaFabricacion ?? '202401',
    sujetoId: overrides.sujetoId ?? 1,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
}
