import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { v4 as uuidv4 } from 'uuid';

export const getUser = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid;
    const data = await UserService.fetchUserByUuid(uuid);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    const users = await UserService.fetchUserByUsername(username) as any[];
    const user = users[0];
    if (users.length > 0 && user.password === password) {
      return res.json({ success: true, user: { uuid: user.uuid, username: user.username, created_at: user.created_at } });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    const users = await UserService.fetchUserByUsername(username) as any[];
    if (users.length > 0) {
      return res.status(304).json({ success: false, error: 'User already exists' });
    }
    const user = { uuid: uuidv4(), username, password, created_at: new Date() };
    await UserService.registerUser(user);
    res.json({ success: true, message: 'Registration successful. Please login to continue.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 