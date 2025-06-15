import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
};

export const initializeDatabase = async () => {
  // Create connection without selecting a database
  const pool = mysql.createPool(dbConfig);

  try {
    // Create database if it doesn't exist
    await pool.query(`CREATE DATABASE IF NOT EXISTS db_nmcnpm`);
    console.log('Database "db_nmcnpm" created or already exists.');

    // Switch to the new database for table creation
    await pool.query(`USE db_nmcnpm`);

    // SQL statements to create tables
    const sqlInitTables = [
      `CREATE TABLE IF NOT EXISTS users (
        uuid char(36),
        username varchar(30) NOT NULL,
        password varchar(50) NOT NULL,
        created_at timestamp NOT NULL,
        updated_at timestamp,
        deleted_at timestamp,
        PRIMARY KEY(uuid)
      );`,
      `CREATE TABLE IF NOT EXISTS historys (
        uuid char(36),
        created_at timestamp NOT NULL,
        updated_at timestamp,
        deleted_at timestamp,
        user_uuid char(36),
        PRIMARY KEY(uuid),
        CONSTRAINT fk_users_historys_from_user FOREIGN KEY (user_uuid) REFERENCES users(uuid)
      );`,
      `CREATE TABLE IF NOT EXISTS logs (
        uuid char(36),
        number_sentence int,
        sentences text,
        history_uuid char(36),
        created_at timestamp NOT NULL,
        updated_at timestamp,
        deleted_at timestamp,
        item_role char(36),
        PRIMARY KEY(uuid),
        CONSTRAINT fk_historys_logs_from_history FOREIGN KEY (history_uuid) REFERENCES historys(uuid)
      );`,
      `CREATE TABLE IF NOT EXISTS saved_words (
        id char(36) PRIMARY KEY,
        user_uuid char(36) NOT NULL,
        word varchar(255) NOT NULL,
        meaning text NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_savedwords_user FOREIGN KEY (user_uuid) REFERENCES users(uuid)
      );`,
    ];

    for (const sql of sqlInitTables) {
      await pool.query(sql);
    }
    console.log('Tables initialized successfully.');
  } catch (err: any) {
    console.error('Error initializing database:', err);
    // Exit process if DB initialization fails, as the app cannot run
    process.exit(1);
  } finally {
    await pool.end();
  }
};