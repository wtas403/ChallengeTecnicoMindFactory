import { prisma } from '../lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaDbClient = PrismaClient | Prisma.TransactionClient;

const automotorInclude = {
  sujeto: true,
} as const;

export class AutomotoresRepository {
  list(db: PrismaDbClient = prisma) {
    return db.automotor.findMany({
      include: automotorInclude,
      orderBy: { dominio: 'asc' },
    });
  }

  findByDominio(dominio: string, db: PrismaDbClient = prisma) {
    return db.automotor.findUnique({
      where: { dominio },
      include: automotorInclude,
    });
  }

  findByChasis(chasis: string, db: PrismaDbClient = prisma) {
    return db.automotor.findUnique({ where: { chasis } });
  }

  findByMotor(motor: string, db: PrismaDbClient = prisma) {
    return db.automotor.findUnique({ where: { motor } });
  }

  create(data: {
    dominio: string;
    chasis: string;
    motor: string;
    color: string;
    fechaFabricacion: string;
    sujetoId: number;
  }, db: PrismaDbClient = prisma) {
    return db.automotor.create({
      data,
      include: automotorInclude,
    });
  }

  update(
    dominio: string,
    data: {
      chasis: string;
      motor: string;
      color: string;
      fechaFabricacion: string;
      sujetoId: number;
    },
    db: PrismaDbClient = prisma,
  ) {
    return db.automotor.update({
      where: { dominio },
      data,
      include: automotorInclude,
    });
  }

  delete(dominio: string, db: PrismaDbClient = prisma) {
    return db.automotor.delete({ where: { dominio } });
  }
}
