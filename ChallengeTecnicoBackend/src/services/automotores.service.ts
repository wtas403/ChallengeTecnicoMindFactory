import { ConflictError } from '../errors/conflict-error';
import { NotFoundError } from '../errors/not-found-error';
import { ValidationError } from '../errors/validation-error';
import { AutomotoresRepository } from '../repositories/automotores.repository';
import { SujetosRepository } from '../repositories/sujetos.repository';
import { CreateAutomotorInput, UpdateAutomotorInput } from '../validators/automotor.schemas';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

type TransactionRunner = <T>(
  callback: (transactionClient: Prisma.TransactionClient) => Promise<T>,
) => Promise<T>;

const runDefaultTransaction: TransactionRunner = (callback) => prisma.$transaction(callback);

export class AutomotoresService {
  constructor(
    private readonly automotoresRepository = new AutomotoresRepository(),
    private readonly sujetosRepository = new SujetosRepository(),
    private readonly runTransaction: TransactionRunner = runDefaultTransaction,
  ) {}

  list() {
    return this.automotoresRepository.list();
  }

  async getByDominio(dominio: string) {
    const automotor = await this.automotoresRepository.findByDominio(dominio);

    if (!automotor) {
      throw new NotFoundError('No existe un automotor para el dominio informado.', 'AUTOMOTOR_NOT_FOUND');
    }

    return automotor;
  }

  async create(input: CreateAutomotorInput) {
    return this.runTransaction(async (transactionClient) => {
      await this.ensureDominioAvailable(input.dominio, transactionClient);
      await this.ensureUniqueChasis(input.chasis, undefined, transactionClient);
      await this.ensureUniqueMotor(input.motor, undefined, transactionClient);

      const sujeto = await this.resolveTitularForMutation(
        input.cuitTitular,
        input.nombreTitular,
        transactionClient,
      );

      return this.automotoresRepository.create(
        {
          dominio: input.dominio,
          chasis: input.chasis,
          motor: input.motor,
          color: input.color,
          fechaFabricacion: input.fechaFabricacion,
          sujetoId: sujeto.id,
        },
        transactionClient,
      );
    });
  }

  async update(dominio: string, input: UpdateAutomotorInput) {
    return this.runTransaction(async (transactionClient) => {
      const existingAutomotor = await this.automotoresRepository.findByDominio(dominio, transactionClient);

      if (!existingAutomotor) {
        throw new NotFoundError(
          'No existe un automotor para el dominio informado.',
          'AUTOMOTOR_NOT_FOUND',
        );
      }

      await this.ensureUniqueChasis(input.chasis, existingAutomotor.id, transactionClient);
      await this.ensureUniqueMotor(input.motor, existingAutomotor.id, transactionClient);

      const sujeto = await this.resolveTitularForMutation(
        input.cuitTitular,
        input.nombreTitular,
        transactionClient,
      );

      return this.automotoresRepository.update(
        dominio,
        {
          chasis: input.chasis,
          motor: input.motor,
          color: input.color,
          fechaFabricacion: input.fechaFabricacion,
          sujetoId: sujeto.id,
        },
        transactionClient,
      );
    });
  }

  async delete(dominio: string) {
    await this.getByDominio(dominio);
    await this.automotoresRepository.delete(dominio);
  }

  private async ensureDominioAvailable(
    dominio: string,
    transactionClient: Prisma.TransactionClient,
  ) {
    const existingAutomotor = await this.automotoresRepository.findByDominio(dominio, transactionClient);

    if (existingAutomotor) {
      throw new ConflictError('Ya existe un automotor para el dominio informado.', [
        { field: 'dominio', message: 'Ya existe un automotor para el dominio informado.' },
      ], 'AUTOMOTOR_DOMINIO_ALREADY_EXISTS');
    }
  }

  private async ensureUniqueChasis(
    chasis: string,
    currentAutomotorId?: number,
    transactionClient?: Prisma.TransactionClient,
  ) {
    const automotor = await this.automotoresRepository.findByChasis(chasis, transactionClient);

    if (automotor && automotor.id !== currentAutomotorId) {
      throw new ConflictError('Ya existe un automotor con el chasis informado.', [
        { field: 'chasis', message: 'Ya existe un automotor con el chasis informado.' },
      ], 'AUTOMOTOR_CHASIS_ALREADY_EXISTS');
    }
  }

  private async ensureUniqueMotor(
    motor: string,
    currentAutomotorId?: number,
    transactionClient?: Prisma.TransactionClient,
  ) {
    const automotor = await this.automotoresRepository.findByMotor(motor, transactionClient);

    if (automotor && automotor.id !== currentAutomotorId) {
      throw new ConflictError('Ya existe un automotor con el motor informado.', [
        { field: 'motor', message: 'Ya existe un automotor con el motor informado.' },
      ], 'AUTOMOTOR_MOTOR_ALREADY_EXISTS');
    }
  }

  private async resolveTitularForMutation(
    cuitTitular: string,
    nombreTitular: string | undefined,
    transactionClient: Prisma.TransactionClient,
  ) {
    const sujeto = await this.sujetosRepository.findByCuit(cuitTitular, transactionClient);

    if (sujeto) {
      return sujeto;
    }

    if (!nombreTitular) {
      throw new ValidationError(
        'No existe un sujeto para el CUIT informado.',
        [
          {
            field: 'nombreTitular',
            message:
              'No existe un sujeto para este CUIT. Ingresa el nombre completo para crearlo junto al automotor.',
          },
        ],
        'TITULAR_NOT_FOUND',
      );
    }

    return this.sujetosRepository.create(
      {
        cuit: cuitTitular,
        nombreCompleto: nombreTitular,
      },
      transactionClient,
    );
  }
}
