create schema db_nmcnpm;

use db_nmcnpm;
CREATE TABLE  IF NOT EXISTS users (
  uuid char(36),
  username varchar(30) NOT NULL,
  password varchar(50) NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  PRIMARY KEY(uuid)
  );
  CREATE TABLE  IF NOT EXISTS historys (
  uuid char(36),
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  user_uuid char(36),
  PRIMARY KEY(uuid),
  CONSTRAINT fk_users_historys_from_user FOREIGN KEY (user_uuid) REFERENCES users(uuid)
  );
  
  CREATE TABLE  IF NOT EXISTS logs (
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
  );
  
  CREATE TABLE IF NOT EXISTS saved_words (
  id CHAR(36) PRIMARY KEY,
  user_uuid CHAR(36) NOT NULL,
  word VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);
