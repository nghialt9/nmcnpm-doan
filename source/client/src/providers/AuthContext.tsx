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
  uuid: string;
  username: string;
  created_at: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

type Action =
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string | null }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
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
      clearError: () => void;
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

      // Dispatch LOGIN_SUCCESS from localStorage if user data exists
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    }
  }, []); // Run only once on mount

  const login = async (username: string, password: string) => {
    try {
      const response = await serviceLogin(username, password);
      if (response.success && response.user) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        console.error("Login failed:", response.error);
        dispatch({ type: "LOGIN_FAILURE", payload: response.error || "Login failed." });
        localStorage.removeItem("user");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message || "Login failed due to network error." });
      localStorage.removeItem("user");
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await serviceRegister(username, password);
      if (response.success && response.user) {
        dispatch({ type: "REGISTER_SUCCESS", payload: response.user });
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        console.error("Registration failed:", response.error);
        dispatch({ type: "LOGIN_FAILURE", payload: response.error || "Registration failed." });
        localStorage.removeItem("user");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message || "Registration failed due to network error." });
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout, register, clearError }}>
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
