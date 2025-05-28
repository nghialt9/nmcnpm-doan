import { apiCaller } from "../../apis/apiCaller";
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

export const login = async (
  username: string,
  password: string
): Promise<void> => {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve();
  //   }, 1000);
  // });

  return apiCaller(`${BASE_URL}/user/login`, "POST", { username, password });
};

export const register = async (
  username: string,
  password: string
): Promise<boolean> => {
  return apiCaller(`${BASE_URL}/user/register`, "POST", { username, password });
  // return true;
};
