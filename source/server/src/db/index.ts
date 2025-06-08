import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

export const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: 'db_nmcnpm',
}); 