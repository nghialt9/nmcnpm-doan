import { connection } from '../db';
import { ConversationLog } from '../types/entities';

export const getConversationsByHistoryId = async (history_uuid: string): Promise<ConversationLog[]> => {
  const result = await connection.query('SELECT * FROM logs WHERE history_uuid = $1', [history_uuid]);
  return result.rows as ConversationLog[];
};

export const saveConversation = async (log: ConversationLog) => {
  await connection.query(
    `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      log.uuid,
      log.number_sentence,
      log.sentences,
      log.history_uuid,
      log.created_at,
      log.role,
    ]
  );
}; 