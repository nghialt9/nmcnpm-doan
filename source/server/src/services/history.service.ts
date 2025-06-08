import * as HistoryModel from '../models/history.model';

export const fetchHistoriesByUserUuid = async (user_uuid: string) => {
  return await HistoryModel.getHistoriesByUserUuid(user_uuid);
};

export const createHistory = async (history: any) => {
  await HistoryModel.createHistory(history);
}; 