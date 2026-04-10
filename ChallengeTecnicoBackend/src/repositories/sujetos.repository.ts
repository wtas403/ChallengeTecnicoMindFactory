import { prisma } from '../lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaDbClient = PrismaClient | Prisma.TransactionClient;

export class SujetosRepository {
  findByCuit(cuit: string, db: PrismaDbClient = prisma) {
    return db.sujeto.findUnique({ where: { cuit } });
  }

  create(data: { cuit: string; nombreCompleto: string }, db: PrismaDbClient = prisma) {
    return db.sujeto.create({ data });
  }
}
