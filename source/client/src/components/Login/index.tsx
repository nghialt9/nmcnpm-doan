import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../providers/AuthContext";
import { Navigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import "./login.css";

const LoginSignupForm: React.FC = () => {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const { login, register, state, clearError } = useAuth();
  const inputUserNameRef = useRef<HTMLInputElement | null>(null);
  const inputPasswordRef = useRef<HTMLInputElement | null>(null);

  const [action, setAction] = useState("");
  const registerLink = () => {
    setAction(" active");
    clearError();
  };

  const loginLink = () => {
    setAction("");
    clearError();
  };

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    }
  }, [state]);

  const _handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const username = inputUserNameRef.current?.value || "";
    const password = inputPasswordRef.current?.value || "";
    await login(username, password);
  };

  const _handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await register(registerUsername, registerPassword);
  };

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-login">
      <div className={`wrapper${action}`}>
        {/* Login Screen */}
        <div className="form-box login">
          <form action="" onSubmit={_handleLoginSubmit}>
            <h1>Login</h1>

            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                ref={inputUserNameRef}
                placeholder="Username"
                required
                onChange={clearError}
              />
            </div>

            <div className="input-box">
              <RiLockPasswordFill className="icon" />
              <input
                type="password"
                ref={inputPasswordRef}
                placeholder="Password"
                required
                onChange={clearError}
              />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <button className="forgot-password-button">Forgot Password?</button>
            </div>

            <button type="submit">Login</button>

            {state.error && <div className="error-message" style={{ display: 'block !important', color: 'red !important', background: 'white !important' }}>{state.error}</div>}

            <div className="register-link">
              <p>
                Don't have an account ?{" "}
                <button onClick={registerLink} className="link-button">
                  Register Now
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Screen */}
        <div className="form-box register">
          <form action="" onSubmit={_handleRegister}>
            <h1>Registration</h1>

            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Username"
                required
                value={registerUsername}
                onChange={(e) => {
                  setRegisterUsername(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="input-box">
              <RiLockPasswordFill className="icon" />
              <input
                type="password"
                placeholder="Password"
                required
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />I agree to the terms & conditions
              </label>
            </div>

            <button type="submit">Register</button>

            <div className="register-link">
              <p>
                Have an account ?{" "}
                <button onClick={loginLink} className="link-button">
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>

        {state.error && action === " active" && <div className="error-message">{state.error}</div>}
      </div>
    </div>
  );
};

export default LoginSignupForm;
