import { Request, Response } from 'express';
import { mapAutomotorToDto } from '../mappers/automotor.mapper';
import { AutomotoresService } from '../services/automotores.service';
import {
  parseCreateAutomotorInput,
  parseDominioParam,
  parseUpdateAutomotorInput,
} from '../validators/automotor.schemas';

export class AutomotoresController {
  constructor(private readonly automotoresService = new AutomotoresService()) {}

  list = async (_req: Request, res: Response) => {
    const automotores = await this.automotoresService.list();
    res.status(200).json(automotores.map(mapAutomotorToDto));
  };

  getByDominio = async (req: Request, res: Response) => {
    const dominio = parseDominioParam(req.params);
    const automotor = await this.automotoresService.getByDominio(dominio);
    res.status(200).json(mapAutomotorToDto(automotor));
  };

  create = async (req: Request, res: Response) => {
    const input = parseCreateAutomotorInput(req.body);
    const automotor = await this.automotoresService.create(input);
    res.status(201).json(mapAutomotorToDto(automotor));
  };

  update = async (req: Request, res: Response) => {
    const dominio = parseDominioParam(req.params);
    const input = parseUpdateAutomotorInput(req.body);
    const automotor = await this.automotoresService.update(dominio, input);
    res.status(200).json(mapAutomotorToDto(automotor));
  };

  delete = async (req: Request, res: Response) => {
    const dominio = parseDominioParam(req.params);
    await this.automotoresService.delete(dominio);
    res.status(204).send();
  };
}
