import { Router } from 'express';
import { SujetosController } from '../controllers/sujetos.controller';

const sujetosController = new SujetosController();

export const sujetosRouter = Router();

sujetosRouter.get('/by-cuit', sujetosController.getByCuit);
sujetosRouter.post('/', sujetosController.create);
