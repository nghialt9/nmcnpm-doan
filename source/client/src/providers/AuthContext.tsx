import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

import {
  register as serviceRegister,
  login as serviceLogin,
} from "../services/authentication";

interface User {
  username: string;
  password: string;
  uuid: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

type Action =
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        isAuthenticated: true,
        user: action.payload,
      };
    case "REGISTER_SUCCESS":
      return {
        isAuthenticated: true,
        user: action.payload,
      };
    case "LOGIN_FAILURE":
    case "LOGOUT":
      return {
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<
  | {
      state: AuthState;
      dispatch: React.Dispatch<Action>;
      login: (username: string, password: string) => Promise<void>;
      register: (username: string, password: string) => Promise<void>;
      logout: () => void;
    }
  | undefined
>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log("storedUser load", user);

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const loggedInUser: any = await serviceLogin(username, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: loggedInUser[0] });
      localStorage.setItem("user", JSON.stringify(loggedInUser[0]));
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE" });
      localStorage.removeItem("user");
    }
  };

  const register = async (username: string, password: string) => {
    try {
      debugger;
      const loggedInUser: any = await serviceRegister(username, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: loggedInUser });
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE" });
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
