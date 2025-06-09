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

export const speechToText = async (audioBlob: Blob): Promise<string | null> => {
  try {
    console.log("OpenAI API Call: Transcribing audio...");
    console.log("  Audio Blob details:", { size: audioBlob.size, type: audioBlob.type });

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions", // Correct endpoint for audio transcription
      // Create FormData to send the audio file
      (() => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav'); // Append the audio blob
        formData.append('model', 'whisper-1'); // Specify the Whisper model
        // formData.append('response_format', 'text'); // Optional: specify response format (default is json)
        console.log("  FormData created.", formData);
        return formData;
      })(),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`, // Use environment variable
        },
      }
    );
    
    console.log("  Request headers:", { Authorization: `Bearer ${apiKey ? '...' : '[API Key Missing]'}` });
    
    console.log("OpenAI API Response:", response);

    // Assuming the response format is text, or the text is in response.data.text if json
    // Adjust based on the actual API response structure
    if (response.data && response.data.text) {
      console.log("  Transcription text found in response.data.text");
      return response.data.text.trim();
    } else if (typeof response.data === 'string') {
      console.log("  Transcription text found in response.data (string type)");
      return response.data.trim(); // If the response is plain text
    } else {
      console.error("Unexpected response format from OpenAI transcription:", response.data);
      console.log("  Full response data:", response.data);
      return null;
    }
  } catch (error: any) {
    console.error("OpenAI API Call Error:", error.response?.data || error.message || error);
    // Provide a more specific error message
    return "Sorry, an error occurred while transcribing the audio.";
  }
};
