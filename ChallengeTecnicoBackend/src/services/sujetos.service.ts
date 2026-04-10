import { ConflictError } from '../errors/conflict-error';
import { NotFoundError } from '../errors/not-found-error';
import { SujetosRepository } from '../repositories/sujetos.repository';
import { CreateSujetoInput } from '../validators/sujeto.schemas';

export class SujetosService {
  constructor(private readonly sujetosRepository = new SujetosRepository()) {}

  async getByCuit(cuit: string) {
    const sujeto = await this.sujetosRepository.findByCuit(cuit);

    if (!sujeto) {
      throw new NotFoundError('No existe un sujeto para el CUIT informado.', 'SUJETO_NOT_FOUND');
    }

    return sujeto;
  }

  async create(input: CreateSujetoInput) {
    const existingSujeto = await this.sujetosRepository.findByCuit(input.cuit);

    if (existingSujeto) {
      throw new ConflictError('Ya existe un sujeto para el CUIT informado.', [
        { field: 'cuit', message: 'Ya existe un sujeto para el CUIT informado.' },
      ], 'SUJETO_ALREADY_EXISTS');
    }

    return this.sujetosRepository.create(input);
  }
}
