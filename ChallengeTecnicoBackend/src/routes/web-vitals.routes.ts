import { Router } from 'express';
import { WebVitalsController } from '../controllers/web-vitals.controller';

const webVitalsController = new WebVitalsController();

export const webVitalsRouter = Router();

webVitalsRouter.get('/summary', webVitalsController.summary);
webVitalsRouter.post('/', webVitalsController.track);
