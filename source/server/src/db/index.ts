import { Pool } from 'pg';
import { config } from 'dotenv';
config();

// export const connection = new Pool({
//   host: process.env.PG_HOST || process.env.DB_HOST,
//   user: process.env.PG_USER || process.env.DB_USER,
//   password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
//   port: Number(process.env.PG_PORT || process.env.DB_PORT),
//   database: process.env.PG_DATABASE || process.env.DB_DATABASE,
// });

export const connection = new Pool({
  connectionString: 'postgresql://nmcnpm_19lf_user:Lq4yCCW4Zby5ct96VC3Mcvd4ugzMwz91@dpg-d135o8emcj7s7380be5g-a.render.com/nmcnpm_19lf',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Auto create tables if not exist
export const initTables = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      uuid UUID PRIMARY KEY,
      username VARCHAR(30) NOT NULL,
      password VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS historys (
      uuid UUID PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP,
      user_uuid UUID REFERENCES users(uuid)
    );
    CREATE TABLE IF NOT EXISTS logs (
      uuid UUID PRIMARY KEY,
      number_sentence INT,
      sentences TEXT,
      history_uuid UUID REFERENCES historys(uuid),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP,
      item_role VARCHAR(36)
    );
    CREATE TABLE IF NOT EXISTS saved_words (
      id UUID PRIMARY KEY,
      user_uuid UUID REFERENCES users(uuid),
      word VARCHAR(255) NOT NULL,
      meaning TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}; 