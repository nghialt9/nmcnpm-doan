import * as ConversationModel from '../models/conversation.model';

export const fetchConversations = async (history_uuid: string) => {
  return await ConversationModel.getConversationsByHistoryId(history_uuid);
};

export const createConversation = async (log: any) => {
  await ConversationModel.saveConversation(log);
}; 