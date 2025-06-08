import { connection } from '../db';
import { RowDataPacket } from 'mysql2';
import { History } from '../types/entities';

export const getHistoriesByUserUuid = async (user_uuid: string): Promise<History[]> => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM historys WHERE user_uuid = ?', [user_uuid]);
  return rows as History[];
};

export const createHistory = async (history: History) => {
  await connection.query(
    'INSERT INTO historys (uuid, created_at, user_uuid) VALUES (?, ?, ?)',
    [history.uuid, history.created_at, history.user_uuid]
  );
}; 