import * as SavedWordModel from '../models/savedword.model';

export const fetchSavedWordsByUser = async (user_uuid: string) => {
  return await SavedWordModel.getSavedWordsByUser(user_uuid);
};

export const saveWordForUser = async (user_uuid: string, word: string, meaning: string) => {
  return await SavedWordModel.saveWordForUser(user_uuid, word, meaning);
}; 