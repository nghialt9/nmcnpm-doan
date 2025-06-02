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

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
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
      register: (username: string, password: string) => Promise<AuthResponse>;
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
      try {
        const user = JSON.parse(storedUser);
        // Only set the state if the user data is valid
        if (user && user.uuid && user.username) {
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
        } else {
          // If user data is invalid, clear it
          localStorage.removeItem("user");
        }
      } catch (error) {
        // If JSON parsing fails, clear the invalid data
        localStorage.removeItem("user");
      }
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
      if (response.success) {
        // Don't automatically authenticate after registration
        dispatch({ type: "CLEAR_ERROR" });
        return response;
      } else {
        console.error("Registration failed:", response.error);
        // Set the error message from the server
        dispatch({ type: "LOGIN_FAILURE", payload: response.error || "Registration failed." });
        return response; // Return the response with error
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      // Set the error message from the network error
      dispatch({ type: "LOGIN_FAILURE", payload: error.message || "Registration failed due to network error." });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    // Clear all user-related data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    // Clear any other user-related data
    sessionStorage.clear();
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
