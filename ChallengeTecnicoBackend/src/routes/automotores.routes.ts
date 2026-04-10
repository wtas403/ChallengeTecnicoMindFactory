import { Router } from 'express';
import { AutomotoresController } from '../controllers/automotores.controller';

const automotoresController = new AutomotoresController();

export const automotoresRouter = Router();

automotoresRouter.get('/', automotoresController.list);
automotoresRouter.get('/:dominio', automotoresController.getByDominio);
automotoresRouter.post('/', automotoresController.create);
automotoresRouter.put('/:dominio', automotoresController.update);
automotoresRouter.delete('/:dominio', automotoresController.delete);
