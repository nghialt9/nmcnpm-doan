import { connection } from '../db';
import { History } from '../types/entities';

export const getHistoriesByUserUuid = async (user_uuid: string): Promise<History[]> => {
  const result = await connection.query('SELECT * FROM historys WHERE user_uuid = $1', [user_uuid]);
  return result.rows as History[];
};

export const createHistory = async (history: History) => {
  await connection.query(
    'INSERT INTO historys (uuid, created_at, user_uuid) VALUES ($1, $2, $3)',
    [history.uuid, history.created_at, history.user_uuid]
  );
}; 