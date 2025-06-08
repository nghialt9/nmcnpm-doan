import { connection } from '../db';

export const getConversationsByHistoryId = async (history_uuid: string) => {
  const [rows] = await connection.query('SELECT * FROM logs WHERE history_uuid = ?', [history_uuid]);
  return rows;
};

export const saveConversation = async (log: any) => {
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