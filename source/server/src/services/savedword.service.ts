import * as SavedWordModel from '../models/savedword.model';
import { SavedWord } from '../types/entities';

export const fetchSavedWordsByUser = async (user_uuid: string): Promise<SavedWord[]> => {
  return await SavedWordModel.getSavedWordsByUser(user_uuid);
};

export const saveWordForUser = async (user_uuid: string, word: string, meaning: string): Promise<SavedWord> => {
  return await SavedWordModel.saveWordForUser(user_uuid, word, meaning);
}; 