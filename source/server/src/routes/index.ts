import express from "express";
import mysql, { RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import OpenAI from "openai";
import cors from "cors";

const router = express.Router();
config();

// Enable CORS
router.use(cors());
router.use(express.json());

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create initial connection without database
const initialConnection = mysql.createPool(dbConfig);

// Promise to track database initialization status
let dbInitializedPromise: Promise<void>;

// Initialize database and tables
dbInitializedPromise = (async () => {
  try {
    // Create database if not exists
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS db_nmcnpm`);
    
    // Switch to the database
    await initialConnection.query(`USE db_nmcnpm`);
    
    // Create tables
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
        PRIMARY KEY(uuid),
        item_role char(36),
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
      await initialConnection.query(sql);
    }
    console.log('Database and tables initialized successfully');
  } catch (err: any) {
    console.error('Error initializing database:', err);
  }
})();

// Create connection pool with database
const connection = mysql.createPool({
  ...dbConfig,
  database: 'db_nmcnpm'
});

interface User {
  uuid: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface UserRow extends RowDataPacket {
  uuid: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

//get user by uuid
router.get("/user/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const [rows] = await connection.query(
      `SELECT * FROM users WHERE uuid = ?`,
      [uuid]
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// login
router.post("/user/login", async (req, res) => {
  await dbInitializedPromise; // Wait for database to be initialized
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }

    const [rows] = await connection.query<UserRow[]>(
      `SELECT * FROM users where username = ? and password = ?`,
      [username, password]
    );

    console.log('Query result:', rows);

    if (rows.length > 0) {
      const user = rows[0];
      const response = {
        success: true,
        user: {
          uuid: user.uuid,
          username: user.username,
          created_at: user.created_at
        }
      };
      console.log('Sending response:', response);
      return res.json(response);
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({
        success: false,
        error: "Invalid username or password"
      });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// register
router.post("/user/register", async (req, res) => {
  await dbInitializedPromise; // Wait for database to be initialized
  try {
    console.log('Register attempt:', req.body);
    const user: User = {
      uuid: uuidv4(),
      username: req.body.username,
      password: req.body.password,
      created_at: new Date(),
    };

    if (!user.username || !user.password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }

    console.log('Checking for existing user...');
    const [existingUsers] = await connection.query<UserRow[]>(
      `SELECT * FROM users where username = ?`,
      [user.username]
    );

    if (existingUsers.length > 0) {
      console.log('User already exists');
      return res.status(304).json({ 
        success: false,
        error: "User already exists" 
      });
    }

    console.log('Inserting new user...');
    await connection.query(
      `INSERT INTO users (uuid, username, password, created_at) VALUES (?, ?, ?, ?)`,
      [user.uuid, user.username, user.password, user.created_at]
    );

    const response = {
      success: true,
      message: "Registration successful. Please login to continue."
    };
    console.log('Sending register success response:', response);
    res.json(response);
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// save history
router.post("/history/save", async (req, res) => {
  try {
    const history = {
      uuid: uuidv4(),
      created_at: new Date(),
      user_uuid: req.body.user_uuid,
    };

    await connection.query(
      `INSERT INTO historys (uuid, created_at, user_uuid) VALUES (?, ?, ?)`,
      [history.uuid, history.created_at, history.user_uuid]
    );
    res.json({
      success: true,
      data: history
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

//get history by user_uuid
router.get("/history/:user_uuid", async (req, res) => {
  try {
    const user_uuid = req.params.user_uuid;
    const [rows] = await connection.query(
      `SELECT * FROM historys WHERE user_uuid = ?`,
      [user_uuid]
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error"
    });
  }
});

// save conversation
// save conversation and return answer + suggestions
router.post("/conversation/save", async (req, res) => {
  try {
    const log = {
      uuid: uuidv4(),
      number_sentence: req.body.number_sentence,
      sentences: req.body.sentences,
      history_uuid: req.body.history_uuid,
      created_at: new Date(),
      role: "user",
    };

    // Save user message
    await connection.query(
      `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        log.uuid,
        log.number_sentence,
        log.sentences,
        log.history_uuid,
        log.created_at,
        log.role,
      ]
    );

    // Request OpenAI with JSON response instruction
    const prompt = `Answer the question below, and then return 3 follow-up question suggestions to continue the conversation.
Format your response as a JSON object with two fields: "answer" and "suggestions".

Example:
{
  "answer": "Sure, here is the explanation...",
  "suggestions": ["Can you give me an example?", "How does this apply in real life?", "What are the benefits?"]
}

Question: ${log.sentences}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const aiRawResponse = chatCompletion.choices[0].message.content || "";
    let aiAnswer = "";
    let suggestions: string[] = [];

    try {
      const parsed = JSON.parse(aiRawResponse);
      aiAnswer = parsed.answer || "";
      suggestions = parsed.suggestions || [];
    } catch (err) {
      console.error("Failed to parse AI JSON:", err);
      aiAnswer = aiRawResponse; // fallback to raw message
      suggestions = [];
    }

    // Save bot reply
    await connection.query(
      `INSERT INTO logs (uuid, number_sentence, sentences, history_uuid, created_at, item_role) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        log.number_sentence,
        aiAnswer,
        log.history_uuid,
        new Date(),
        "system",
      ]
    );

    res.json({
      success: true,
      message: aiAnswer,
      suggestions,
      userMessage: log,
    });
  } catch (error: any) {
    console.error("conversation/save", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});


//get log by history_uuid
router.get("/conversation/:history_uuid", async (req, res) => {
  try {
    const history_uuid = req.params.history_uuid;
    const [rows] = await connection.query(
      `SELECT * FROM logs WHERE history_uuid = ?`,
      [history_uuid]
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

router.post("/conversation/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Translate the following English text to VietNamese: "${text}"`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const translationText = chatCompletion.choices[0].message.content;
    res.json({
      success: true,
      translatedText: translationText
    });
  } catch (error: any) {
    console.error("conversation/translate", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

export default router;

// — POST /api/words/save — save one word+meaning for the current user
router.post("/words/save", async (req, res) => {
  try {
    const { user_uuid, word, meaning } = req.body;
    if (!user_uuid || !word || !meaning) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }
    const id = uuidv4();
    await connection.query(
      `INSERT INTO saved_words (id, user_uuid, word, meaning) VALUES (?,?,?,?)`,
      [id, user_uuid, word, meaning]
    );
    res.json({ success: true, data: { id, user_uuid, word, meaning } });
  } catch (err: any) {
    console.error("words/save", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// — GET /api/words/:user_uuid — fetch all saved words for this user
router.get("/words/:user_uuid", async (req, res) => {
  try {
    const user_uuid = req.params.user_uuid;
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id, word, meaning, created_at FROM saved_words WHERE user_uuid = ? ORDER BY created_at DESC`,
      [user_uuid]
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("words/get", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
