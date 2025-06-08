import { Request, Response } from 'express';
import * as HistoryService from '../services/history.service';
import { v4 as uuidv4 } from 'uuid';

export const getHistories = async (req: Request, res: Response) => {
  try {
    const user_uuid = req.params.user_uuid;
    const data = await HistoryService.fetchHistoriesByUserUuid(user_uuid);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const saveHistory = async (req: Request, res: Response) => {
  try {
    const history = {
      uuid: uuidv4(),
      created_at: new Date(),
      user_uuid: req.body.user_uuid,
    };
    await HistoryService.createHistory(history);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 