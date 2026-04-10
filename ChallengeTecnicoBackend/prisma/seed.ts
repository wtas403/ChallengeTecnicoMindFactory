import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const juan = await prisma.sujeto.upsert({
    where: { cuit: '20123456786' },
    update: { nombreCompleto: 'Juan Perez' },
    create: { cuit: '20123456786', nombreCompleto: 'Juan Perez' },
  });
  const maria = await prisma.sujeto.upsert({
    where: { cuit: '27345678901' },
    update: { nombreCompleto: 'Maria Gomez' },
    create: { cuit: '27345678901', nombreCompleto: 'Maria Gomez' },
  });
  const carlos = await prisma.sujeto.upsert({
    where: { cuit: '20987654321' },
    update: { nombreCompleto: 'Carlos Diaz' },
    create: { cuit: '20987654321', nombreCompleto: 'Carlos Diaz' },
  });

  await prisma.automotor.upsert({
    where: { dominio: 'AA123BB' },
    update: {
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Rojo',
      fechaFabricacion: '202401',
      sujetoId: juan.id,
    },
    create: {
      dominio: 'AA123BB',
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Rojo',
      fechaFabricacion: '202401',
      sujetoId: juan.id,
    },
  });

  await prisma.automotor.upsert({
    where: { dominio: 'AB456CD' },
    update: {
      chasis: 'CHS-0002',
      motor: 'MTR-0002',
      color: 'Azul',
      fechaFabricacion: '202212',
      sujetoId: maria.id,
    },
    create: {
      dominio: 'AB456CD',
      chasis: 'CHS-0002',
      motor: 'MTR-0002',
      color: 'Azul',
      fechaFabricacion: '202212',
      sujetoId: maria.id,
    },
  });

  await prisma.automotor.upsert({
    where: { dominio: 'AAA999' },
    update: {
      chasis: 'CHS-0003',
      motor: 'MTR-0003',
      color: 'Blanco',
      fechaFabricacion: '202110',
      sujetoId: carlos.id,
    },
    create: {
      dominio: 'AAA999',
      chasis: 'CHS-0003',
      motor: 'MTR-0003',
      color: 'Blanco',
      fechaFabricacion: '202110',
      sujetoId: carlos.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
