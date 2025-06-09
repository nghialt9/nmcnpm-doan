import { connection } from '../db';
import { User } from '../types/entities';

export const getUserByUuid = async (uuid: string): Promise<User[]> => {
  const result = await connection.query('SELECT * FROM users WHERE uuid = $1', [uuid]);
  return result.rows as User[];
};

export const getUserByUsername = async (username: string): Promise<User[]> => {
  const result = await connection.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows as User[];
};

export const createUser = async (user: User) => {
  await connection.query(
    'INSERT INTO users (uuid, username, password, created_at) VALUES ($1, $2, $3, $4)',
    [user.uuid, user.username, user.password, user.created_at]
  );
}; 