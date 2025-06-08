export interface User {
  uuid: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface History {
  uuid: string;
  created_at: Date;
  user_uuid: string;
}

export interface ConversationLog {
  uuid: string;
  number_sentence: number;
  sentences: string;
  history_uuid: string;
  created_at: Date;
  role: string;
}

export interface SavedWord {
  id: string;
  user_uuid: string;
  word: string;
  meaning: string;
  created_at: Date;
} 