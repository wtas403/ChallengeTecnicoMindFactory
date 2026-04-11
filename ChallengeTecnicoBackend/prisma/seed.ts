import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CUIT_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;
const TOTAL_RECORDS = 100;

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

function generateCuit(prefix: string, sequentialNumber: number): string {
  const numericBody = String(sequentialNumber).padStart(8, '0');
  const firstTenDigits = `${prefix}${numericBody}`;
  const checkDigit = calculateCheckDigit(firstTenDigits);

  return `${firstTenDigits}${checkDigit}`;
}

function buildDominio(index: number): string {
  const firstLetter = String.fromCharCode(65 + Math.floor(index / 26) % 26);
  const secondLetter = String.fromCharCode(65 + index % 26);
  const digits = String(100 + index).padStart(3, '0').slice(-3);
  const thirdLetter = String.fromCharCode(65 + (index + 2) % 26);
  const fourthLetter = String.fromCharCode(65 + (index + 3) % 26);

  return `${firstLetter}${secondLetter}${digits}${thirdLetter}${fourthLetter}`;
}

function buildFechaFabricacion(index: number): string {
  const year = 2000 + (index % 25);
  const month = 1 + (index % 12);

  return `${year}${String(month).padStart(2, '0')}`;
}

function buildSujetoName(index: number): string {
  return `Sujeto ${String(index + 1).padStart(2, '0')}`;
}

async function main() {
  await prisma.automotor.deleteMany();
  await prisma.sujeto.deleteMany();

  const prefixes = ['20', '23', '27', '30', '33'] as const;
  const colors = ['Rojo', 'Azul', 'Blanco', 'Negro', 'Gris', 'Verde', 'Amarillo'] as const;

  const sujetosData = Array.from({ length: TOTAL_RECORDS }, (_, index) => {
    const prefix = prefixes[index % prefixes.length];
    const sequentialNumber = index + 1;

    return {
      cuit: generateCuit(prefix, sequentialNumber),
      nombreCompleto: buildSujetoName(index),
    };
  });

  await prisma.sujeto.createMany({
    data: sujetosData,
  });

  const sujetos = await prisma.sujeto.findMany({
    where: {
      cuit: {
        in: sujetosData.map((sujeto) => sujeto.cuit),
      },
    },
    orderBy: {
      cuit: 'asc',
    },
  });

  await prisma.automotor.createMany({
    data: sujetos.map((sujeto, index) => ({
      dominio: buildDominio(index),
      chasis: `CHS-${String(index + 1).padStart(4, '0')}`,
      motor: `MTR-${String(index + 1).padStart(4, '0')}`,
      color: colors[index % colors.length],
      fechaFabricacion: buildFechaFabricacion(index),
      sujetoId: sujeto.id,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    throw error;
  });
