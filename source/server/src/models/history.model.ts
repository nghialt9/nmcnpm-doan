import { connection } from '../db';

export const getHistoriesByUserUuid = async (user_uuid: string) => {
  const [rows] = await connection.query('SELECT * FROM historys WHERE user_uuid = ?', [user_uuid]);
  return rows;
};

export const createHistory = async (history: any) => {
  await connection.query(
    'INSERT INTO historys (uuid, created_at, user_uuid) VALUES (?, ?, ?)',
    [history.uuid, history.created_at, history.user_uuid]
  );
}; 