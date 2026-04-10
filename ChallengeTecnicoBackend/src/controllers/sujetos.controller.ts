import { Request, Response } from 'express';
import { mapSujetoToDto } from '../mappers/sujeto.mapper';
import { SujetosService } from '../services/sujetos.service';
import { parseCreateSujetoInput, parseCuitQuery } from '../validators/sujeto.schemas';

export class SujetosController {
  constructor(private readonly sujetosService = new SujetosService()) {}

  getByCuit = async (req: Request, res: Response) => {
    const cuit = parseCuitQuery(req.query);
    const sujeto = await this.sujetosService.getByCuit(cuit);
    res.status(200).json(mapSujetoToDto(sujeto));
  };

  create = async (req: Request, res: Response) => {
    const input = parseCreateSujetoInput(req.body);
    const sujeto = await this.sujetosService.create(input);
    res.status(201).json(mapSujetoToDto(sujeto));
  };
}
