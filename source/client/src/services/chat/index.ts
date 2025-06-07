import { apiCaller } from "../../apis/apiCaller";
import { formatDateTime } from "../../utils";
import { SubmitConversation, ChatResponse, ConversationResponse } from "../../types/Chat";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

export const saveconversation = async (prompt: string): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/history`, "POST", {});
    return {
      success: true,
      message: response.data
    };
  } catch (error) {
    console.error("Error saveconversation:", error);
    return {
      success: false,
      error: "Failed to save conversation"
    };
  }
};

export const getHistories = async ({ uuid }: any): Promise<any> => {
  try {
    const response = await apiCaller(
      `${BASE_URL}/history/${uuid}`,
      "GET",
      {}
    );
    if (!response.success || !response.data) return { success: false, error: response.error || "No data received" };
    return { success: true, data: response.data.map((itemX: any) => {
      return {
        ...itemX,
        history_uuid: itemX.uuid,
        createdAt: formatDateTime(new Date(itemX.created_at)),
      };
    }) };
  } catch (error) {
    console.error("Error getHistories:", error);
    return { success: false, error: "Failed to get histories" };
  }
};

export const saveHistories = async ({ user_uuid }: any): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/history/save`, "POST", {
      user_uuid: user_uuid,
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error saveHistories:", error);
    return {
      success: false,
      error: "Failed to save history"
    };
  }
};

export const getConversationByHistoryId = async (
  history_uuid: string
): Promise<ConversationResponse> => {
  try {
    const response = await apiCaller(
      `${BASE_URL}/conversation/${history_uuid}`,
      "GET",
      {}
    );
    if (!response.success || !response.data) return { success: true, conversations: [] };
    
    const conversations = response.data
      .sort((a: any, b: any) => {
        if (a.created_at > b.created_at) return 1;
        if (a.created_at < b.created_at) return -1;
        return 0;
      })
      .map((item: any) => ({
        uuid: item.uuid,
        sender: item.sender,
        content: item.sentences,
        role: item.item_role,
      }));

    return {
      success: true,
      conversations
    };
  } catch (error) {
    console.error("Error getConversationByHistoryId:", error);
    return {
      success: false,
      error: "Failed to get conversations"
    };
  }
};

export const getLog = async (uuid: string): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/log/${uuid}`, "GET", {});
    return {
      success: true,
      message: response.data
    };
  } catch (error) {
    console.error("Error getLog:", error);
    return {
      success: false,
      error: "Failed to get log"
    };
  }
};

export const saveLog = async ({
  number_sentence,
  sentences,
  history_uuid,
}: any): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/history`, "POST", {
      number_sentence: number_sentence,
      sentences: sentences,
      history_uuid: history_uuid,
    });
    return {
      success: true,
      message: response.data
    };
  } catch (error) {
    console.error("Error saveLog:", error);
    return {
      success: false,
      error: "Failed to save log"
    };
  }
};

export const sendConversation = async (conversation: SubmitConversation): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/conversation/save`, "POST", conversation);
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error("Error sendConversation:", error);
    return {
      success: false,
      error: "Failed to send conversation"
    };
  }
};

export const translate = async (text: string): Promise<ChatResponse> => {
  try {
    const response = await apiCaller(`${BASE_URL}/conversation/translate`, "POST", {
      text,
    });
    return {
      success: true,
      translatedText: response.translatedText
    };
  } catch (error) {
    console.error("Error translate:", error);
    return {
      success: false,
      error: "Failed to translate"
    };
  }
};
// Save one word for a user
export const saveWordForUser = async (user_uuid: string, word: string, meaning: string) => {
  try {
    const response = await apiCaller(`${BASE_URL}/words/save`, "POST", { user_uuid, word, meaning });
    return { success: response.success, data: response.data, error: response.error };
  } catch (err) {
    console.error("Error saveWordForUser:", err);
    return { success: false, error: "Failed to save word" };
  }
};

// Fetch saved words for a user
export const getSavedWordsForUser = async (user_uuid: string) => {
  try {
    const response = await apiCaller(`${BASE_URL}/words/${user_uuid}`, "GET", null);
    return { success: response.success, data: response.data, error: response.error };
  } catch (err) {
    console.error("Error getSavedWordsForUser:", err);
    return { success: false, error: "Failed to fetch saved words" };
  }
};
