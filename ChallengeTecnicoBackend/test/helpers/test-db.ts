import { prisma } from '../../src/lib/prisma';

export async function resetDatabase() {
  await prisma.automotor.deleteMany();
  await prisma.sujeto.deleteMany();
}

export async function seedDatabase() {
  await resetDatabase();

  const juan = await prisma.sujeto.create({
    data: { cuit: '20123456786', nombreCompleto: 'Juan Perez' },
  });
  const maria = await prisma.sujeto.create({
    data: { cuit: '20000000019', nombreCompleto: 'Maria Gomez' },
  });
  const carlos = await prisma.sujeto.create({
    data: { cuit: '20000000028', nombreCompleto: 'Carlos Diaz' },
  });

  await prisma.automotor.createMany({
    data: [
      {
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        sujetoId: juan.id,
      },
      {
        dominio: 'AB456CD',
        chasis: 'CHS-0002',
        motor: 'MTR-0002',
        color: 'Azul',
        fechaFabricacion: '202212',
        sujetoId: maria.id,
      },
      {
        dominio: 'AAA999',
        chasis: 'CHS-0003',
        motor: 'MTR-0003',
        color: 'Blanco',
        fechaFabricacion: '202110',
        sujetoId: carlos.id,
      },
    ],
  });
}

export async function connectTestDatabase() {
  await prisma.$connect();
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
