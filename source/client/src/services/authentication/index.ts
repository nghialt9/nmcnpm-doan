import { apiCaller } from "../../apis/apiCaller";

interface AuthResponse {
  success: boolean;
  user?: {
    uuid: string;
    username: string;
    created_at: string;
  };
  error?: string;
}

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {

  return apiCaller(`${BASE_URL}/user/login`, "POST", { username, password });
};

export const register = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  return apiCaller(`${BASE_URL}/user/register`, "POST", { username, password });
  // return true;
};
