import axios from "axios";
import { apiCaller, apiCallerBlob } from "../../apis/apiCaller";

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

export const generateConversation = async (prompt: string): Promise<string> => {
  try {
    const response = await apiCaller(
      "https://api.openai.com/v1/completions",
      "POST",
      {
        model: "text-davinci-003", // Adjust model as needed
        prompt: `You: ${prompt}`,
        max_tokens: 1024, // Adjust maximum response length
        n: 1,
        stop: null,
        temperature: 0.7, // Adjust temperature for response creativity
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating conversation:", error);
    return "Sorry, an error occurred while generating the conversation.";
  }
};

export const textToSpeech = async (prompt: string): Promise<any> => {
  try {
    const response = await apiCallerBlob(
      "https://api.openai.com/v1/audio/speech",
      "POST",
      {
        model: "tts-1", // Adjust model if needed
        input: prompt,
        voice: "alloy", // Adjust voice if needed
      }
    );

    debugger;
    // const blobUrl = URL.createObjectURL(response.data);
    return response;
  } catch (error) {
    console.error("Error generating conversation:", error);
    return "Sorry, an error occurred while generating textToSpeech.";
  }
};

export const speechToText = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating conversation:", error);
    return "Sorry, an error occurred while generating the conversation.";
  }
};
