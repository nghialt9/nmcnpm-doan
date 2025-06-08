import * as ConversationModel from '../models/conversation.model';
import { ConversationLog } from '../types/entities';

export const fetchConversations = async (history_uuid: string): Promise<ConversationLog[]> => {
  return await ConversationModel.getConversationsByHistoryId(history_uuid);
};

export const createConversation = async (log: ConversationLog) => {
  await ConversationModel.saveConversation(log);
}; 