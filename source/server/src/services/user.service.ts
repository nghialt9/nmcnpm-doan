import * as UserModel from '../models/user.model';

export const fetchUserByUuid = async (uuid: string) => {
  return await UserModel.getUserByUuid(uuid);
};

export const fetchUserByUsername = async (username: string) => {
  return await UserModel.getUserByUsername(username);
};

export const registerUser = async (user: any) => {
  await UserModel.createUser(user);
}; 
export const authenticateUser = async (username: string, password: string): Promise<any> => {
  return await UserModel.getUserByUsernameAndPassword(username, password);
};
