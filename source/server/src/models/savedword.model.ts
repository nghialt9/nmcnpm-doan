import { connection } from '../db';
import { RowDataPacket } from 'mysql2';
import { SavedWord } from '../types/entities';
import { v4 as uuidv4 } from 'uuid';

export const getSavedWordsByUser = async (user_uuid: string): Promise<SavedWord[]> => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM saved_words WHERE user_uuid = ?', [user_uuid]);
  return rows as SavedWord[];
};

export const saveWordForUser = async (user_uuid: string, word: string, meaning: string): Promise<SavedWord> => {
  const id = uuidv4();
  await connection.query(
    'INSERT INTO saved_words (id, user_uuid, word, meaning) VALUES (?, ?, ?, ?)',
    [id, user_uuid, word, meaning]
  );
  return { id, user_uuid, word, meaning, created_at: new Date() };
}; 