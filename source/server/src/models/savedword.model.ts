import { connection } from '../db';

export const getSavedWordsByUser = async (user_uuid: string) => {
  const [rows] = await connection.query('SELECT * FROM saved_words WHERE user_uuid = ?', [user_uuid]);
  return rows;
};

export const saveWordForUser = async (user_uuid: string, word: string, meaning: string) => {
  const id = require('uuid').v4();
  await connection.query(
    'INSERT INTO saved_words (id, user_uuid, word, meaning) VALUES (?, ?, ?, ?)',
    [id, user_uuid, word, meaning]
  );
  return { id, user_uuid, word, meaning };
}; 