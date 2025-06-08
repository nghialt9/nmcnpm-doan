import { connection } from '../db';
import { RowDataPacket } from 'mysql2';

export const getUserByUuid = async (uuid: string) => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE uuid = ?', [uuid]);
  return rows as RowDataPacket[];
};

export const getUserByUsername = async (username: string) => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
  return rows as RowDataPacket[];
};

export const createUser = async (user: any) => {
  await connection.query(
    'INSERT INTO users (uuid, username, password, created_at) VALUES (?, ?, ?, ?)',
    [user.uuid, user.username, user.password, user.created_at]
  );
}; 