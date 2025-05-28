import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../providers/AuthContext";
import { Navigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import "./login.css";

const LoginSignupForm: React.FC = () => {
  const [loginUsername, setLoginUsername] = useState("user");
  const [loginPassword, setLoginPassword] = useState("password");
  const { login, register, state } = useAuth();
  const inputUserNameRef = useRef<HTMLInputElement | null>(null);
  const inputPasswordRef = useRef<HTMLInputElement | null>(null);

  const [action, setAction] = useState("");
  const registerLink = () => {
    setAction(" active");
  };

  const loginLink = () => {
    setAction("");
  };

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    }
  }, [state]);

  const _handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginUsername, loginPassword);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const _handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(loginUsername, loginPassword);
    } catch (error) {
      console.error("Login failed:", error);
    }
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
                defaultValue={"user"}
                ref={inputUserNameRef}
                placeholder="Username"
                required
              />
            </div>

            <div className="input-box">
              <RiLockPasswordFill className="icon" />
              <input
                defaultValue={"password"}
                type="password"
                ref={inputPasswordRef}
                placeholder="Password"
                required
              />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit">Login</button>

            <div className="register-link">
              <p>
                Don't have an account ?{" "}
                <a href="#" onClick={registerLink}>
                  Register Now
                </a>
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
              <input type="text" placeholder="Username" required />
            </div>

            <div className="input-box">
              <RiLockPasswordFill className="icon" />
              <input type="password" placeholder="Password" required />
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
                <a href="#" onClick={loginLink}>
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;
