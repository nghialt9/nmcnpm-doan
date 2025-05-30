export interface Message {
  sender: string;
  content: string;
  role?: string;
  uuid?: string;
}

export interface ChatProps {}

export interface TextToSpeechProps {
  formText: string; // Text to be converted to speech
}

export interface SubmitConversation {
  number_sentence: string;
  sentences: string;
  history_uuid: string;
}

export interface GetConversationHistory {
  history_uuid: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  translatedText?: string;
  data?: any;
}

export interface ConversationResponse {
  success: boolean;
  conversations?: Message[];
  error?: string;
}
