export interface User {
  username: string;
  password: string;
}

export interface Chat {}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
