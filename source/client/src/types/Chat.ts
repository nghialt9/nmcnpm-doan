export interface Message {
  sender: string;
  content: string;
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
