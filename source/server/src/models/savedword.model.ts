import { connection } from '../db';
import { SavedWord } from '../types/entities';
import { v4 as uuidv4 } from 'uuid';

export const getSavedWordsByUser = async (user_uuid: string): Promise<SavedWord[]> => {
  const result = await connection.query('SELECT * FROM saved_words WHERE user_uuid = $1', [user_uuid]);
  return result.rows as SavedWord[];
};

export const saveWordForUser = async (user_uuid: string, word: string, meaning: string): Promise<SavedWord> => {
  const id = uuidv4();
  await connection.query(
    'INSERT INTO saved_words (id, user_uuid, word, meaning) VALUES ($1, $2, $3, $4)',
    [id, user_uuid, word, meaning]
  );
  return { id, user_uuid, word, meaning, created_at: new Date() };
}; 