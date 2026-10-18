import { Request, Response } from 'express';
import { Event } from '../models/Event';

export class EventController {
  static async listEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await Event.find({ isActive: true }).sort({ startDate: -1 });
      res.json({ success: true, events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
