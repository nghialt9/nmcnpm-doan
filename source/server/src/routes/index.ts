import express from "express";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import OpenAI from "openai";

const router = express.Router();
config();

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // "", // process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

const connection = mysql.createConnection(dbConfig);

//init tables
const sqlInitTables = [
  `CREATE DATABASE IF NOT EXISTS db_tkpm;`,
  `USE db_tkpm;`,
  `CREATE TABLE  IF NOT EXISTS users (
  uuid char(36),
  username varchar(30) NOT NULL,
  password varchar(50) NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  PRIMARY KEY(uuid)
  );`,
  `CREATE TABLE  IF NOT EXISTS historys (
  uuid char(36),
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  user_uuid char(36),
  PRIMARY KEY(uuid),
  CONSTRAINT fk_users_historys_from_user FOREIGN KEY (user_uuid) REFERENCES users(uuid)
  );`,
  `CREATE TABLE  IF NOT EXISTS logs (
  uuid char(36),
  number_sentence int,
  sentences text,
  history_uuid char(36),
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  PRIMARY KEY(uuid),
  item_role char(36),
  CONSTRAINT fk_historys_logs_from_history FOREIGN KEY (history_uuid) REFERENCES historys(uuid)
  );`,
];

//init database
sqlInitTables.forEach((sql) => {
  connection.query(sql, (err, results) => {
    if (err) throw err;
  });
});

interface User {
  uuid: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

//get user by uuid
router.get("/user/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  connection.query(
    `SELECT * FROM users WHERE uuid = ?`,
    [uuid],
    (err, rows) => {
      if (err) throw err;
      res.send(rows);
    }
  );
});

// login
router.post("/user/login", (req, res) => {
  let user: User = {
    uuid: uuidv4(),
    username: req.body.username,
    password: req.body.password,
    created_at: new Date(),
  };
  console.log(user);
  // save user to database
  connection.query(
    `SELECT * FROM users where username = ? and password = ?`,
    [user.username, user.password],
    (err, rows) => {
      if (err) throw err;
      res.send(rows);
    }
  );
});

// register
router.post("/user/register", (req, res) => {
  let user: User = {
    uuid: uuidv4(),
    username: req.body.username,
    password: req.body.password,
    created_at: new Date(),
  };

  let existUser = false;
  connection.query(
    `SELECT * FROM users where username = ? `,
    [user.username],
    (err, rows: any) => {
      if (rows?.length > 0) {
        existUser = true;
        res.status(304).json({ error: "Exist user" });
      }
    }
  );

  // save user to database
  connection.query(
    `INSERT INTO users (uuid, username, password, created_at) VALUES (?, ?, ?, ?)`,
    [user.uuid, user.username, user.password, user.created_at],
    (err, rows) => {
      if (err) throw err;
      console.log(user);
      res.send(user);
    }
  );
});

// save history
router.post("/history/save", (req, res) => {
  let history = {
    uuid: uuidv4(),
    created_at: new Date(),
    user_uuid: req.body.user_uuid,
  };
  // save history to database
  connection.query(
    `INSERT INTO historys (uuid, created_at, user_uuid) VALUES (?, ?, ?)`,
    [history.uuid, history.created_at, history.user_uuid],
    (err, rows) => {
      if (err) throw err;
    }
  );
  res.send(history);
});

//get history by user_uuid
router.get("/history/:user_uuid", (req, res) => {
  const user_uuid = req.params.user_uuid;
  connection.query(
    `SELECT * FROM historys WHERE user_uuid = ?`,
    [user_uuid],
    (err, rows) => {
      if (err) throw err;
      res.send(rows);
    }
  );
});

// save conversation
router.post("/conversation/save", async (req, res) => {
  try {
    let log = {
      uuid: uuidv4(),
      number_sentence: req.body.number_sentence,
      sentences: req.body.sentences,
      history_uuid: req.body.history_uuid,
      created_at: new Date(),
      role: "user",
    };
    // save log to database
    connection.query(
      `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        log.uuid,
        log.number_sentence,
        log.sentences,
        log.history_uuid,
        log.created_at,
        log.role,
      ],
      (err, rows) => {
        if (err) throw err;
      }
    );

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: log.sentences }],
      model: "gpt-3.5-turbo",
    });

    const openaimessage = chatCompletion.choices[0].message.content;
    console.log("conversation/save", openaimessage);

    await connection.query(
      `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        log.number_sentence,
        openaimessage,
        log.history_uuid,
        new Date(),
        "system",
      ],
      (err, rows) => {
        if (err) throw err;
        res.send({
          message: openaimessage,
        });
      }
    );
  } catch (error) {
    console.log("conversation/save", error);
  }
});

//get log by history_uuid
router.get("/conversation/:history_uuid", (req, res) => {
  const history_uuid = req.params.history_uuid;
  connection.query(
    `SELECT * FROM logs WHERE history_uuid = ?`,
    [history_uuid],
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      res.send(rows);
    }
  );
});

router.post("/conversation/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Translate the following English text to VietNamese: "${text}"`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(chatCompletion);
    const translationText = chatCompletion.choices[0].message.content;
    console.log("conversation/translate", translationText);
    res.send({
      translatedText: translationText,
    });
  } catch (error) {
    console.log("conversation/translate", error);
  }
});

export default router;
