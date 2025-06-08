import { connection } from '../db';
import { RowDataPacket } from 'mysql2';
import { ConversationLog } from '../types/entities';

export const getConversationsByHistoryId = async (history_uuid: string): Promise<ConversationLog[]> => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM logs WHERE history_uuid = ?', [history_uuid]);
  return rows as ConversationLog[];
};

export const saveConversation = async (log: ConversationLog) => {
  await connection.query(
    `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES (?, ?, ?, ?, ?, ?)`,
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