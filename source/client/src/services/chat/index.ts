import { apiCaller } from "../../apis/apiCaller";
import { formatDateTime } from "../../utils";
import { SubmitConversation } from "../../types/Chat";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

export const saveconversation = async (prompt: string): Promise<string> => {
  try {
    return await apiCaller(`${BASE_URL}/history`, "POST", {});
  } catch (error) {
    console.error("Error saveconversation:", error);
    return "Sorry, an error occurred while saveconversation.";
  }
};

export const getHistories = async ({ uuid }: any): Promise<any> => {
  try {
    const response: any = await apiCaller(
      `${BASE_URL}/history/${uuid}`,
      "GET",
      {}
    );
    if (!response) return [];
    return response.map((itemX: any) => {
      return {
        ...itemX,
        history_uuid: itemX.uuid,
        createdAt: formatDateTime(new Date(itemX.created_at)),
      };
    });
  } catch (error) {
    console.error("Error getHistories:", error);
    return "Sorry, an error occurred while getHistories.";
  }
};

export const saveHistories = async ({ user_uuid }: any): Promise<any> => {
  try {
    return await apiCaller(`${BASE_URL}/history/save`, "POST", {
      user_uuid: user_uuid,
    });
  } catch (error) {
    console.error("Error saveHistories:", error);
    return "Sorry, an error occurred while saveHistories.";
  }
};

export const getConversationByHistoryId = async (
  history_uuid: string
): Promise<any> => {
  try {
    const response = await apiCaller(
      `${BASE_URL}/conversation/${history_uuid}`,
      "GET",
      {}
    );
    if (!response) return { conversations: [] };
    return {
      conversations: response
        .sort((a: any, b: any) => {
          if (a.created_at > b.created_at) return 1;
          if (a.created_at < b.created_at) return -1;
          return 0;
        })
        .map((item: any) => {
          return {
            sender: item.sender,
            content: item.sentences,
            role: item.item_role,
          };
        }),
    };
  } catch (error) {
    console.error("Error getLogs:", error);
    return "Sorry, an error occurred while getLogs";
  }
};
// converstaion
export const getLog = async (uuid: string): Promise<string> => {
  try {
    return await apiCaller(`${BASE_URL}/log/${uuid}`, "GET", {});
  } catch (error) {
    console.error("Error getLog:", error);
    return "Sorry, an error occurred while get Log.";
  }
};

export const saveLog = async ({
  number_sentence,
  sentences,
  history_uuid,
}: any): Promise<string> => {
  try {
    const response = apiCaller(`${BASE_URL}/history`, "POST", {
      number_sentence: number_sentence,
      sentences: sentences,
      history_uuid: history_uuid,
    });
    return response;
  } catch (error) {
    console.error("Error saveLog:", error);
    return "Sorry, an error occurred while saveLog.";
  }
};

export const sendConversation = async (conversation: SubmitConversation) => {
  //
  return await apiCaller(`${BASE_URL}/conversation/save`, "POST", conversation);
};

export const translate = async (text: string) => {
  return await apiCaller(`${BASE_URL}/conversation/translate`, "POST", {
    text,
  });
};
