import { connection } from '../db';
import { RowDataPacket } from 'mysql2';
import { User } from '../types/entities';

export const getUserByUuid = async (uuid: string): Promise<User[]> => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE uuid = ?', [uuid]);
  return rows as User[];
};

export const getUserByUsername = async (username: string): Promise<User[]> => {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
  return rows as User[];
};

export const createUser = async (user: User) => {
  console.log("Inserting into DB:", user);
  await connection.query(
    'INSERT INTO users (uuid, username, password, created_at) VALUES (?, ?, ?, ?)',
    [user.uuid, user.username, user.password, user.created_at]
  );
}; 
export const getUserByUsernameAndPassword = async (username: string, password: string): Promise<User | null> => {
  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
};