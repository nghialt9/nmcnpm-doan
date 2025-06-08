import { Request, Response } from 'express';
import * as SavedWordService from '../services/savedword.service';
import { SavedWord } from '../types/entities';

export const getSavedWords = async (req: Request, res: Response) => {
  try {
    const user_uuid = req.params.user_uuid;
    const data: SavedWord[] = await SavedWordService.fetchSavedWordsByUser(user_uuid);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const saveWord = async (req: Request, res: Response) => {
  try {
    const { user_uuid, word, meaning } = req.body;
    if (!user_uuid || !word || !meaning) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    const data: SavedWord = await SavedWordService.saveWordForUser(user_uuid, word, meaning);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 