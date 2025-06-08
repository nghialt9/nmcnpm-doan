import * as HistoryModel from '../models/history.model';
import { History } from '../types/entities';

export const fetchHistoriesByUserUuid = async (user_uuid: string): Promise<History[]> => {
  return await HistoryModel.getHistoriesByUserUuid(user_uuid);
};

export const createHistory = async (history: History) => {
  await HistoryModel.createHistory(history);
}; 