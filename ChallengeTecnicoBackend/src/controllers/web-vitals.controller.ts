import { Request, Response } from 'express';
import { WebVitalsService } from '../services/web-vitals.service';
import { parseCreateWebVitalInput, parseWebVitalSummaryQuery } from '../validators/web-vitals.schemas';

export class WebVitalsController {
  constructor(private readonly webVitalsService = new WebVitalsService()) {}

  track = async (req: Request, res: Response) => {
    const input = parseCreateWebVitalInput(req.body);
    await this.webVitalsService.track(input);
    res.status(202).json({ status: 'accepted' });
  };

  summary = async (req: Request, res: Response) => {
    const { hours } = parseWebVitalSummaryQuery(req.query);
    const summary = await this.webVitalsService.getSummary(hours);
    res.status(200).json(summary);
  };
}
