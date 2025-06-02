import React, { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { Navigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import "./login.css";

const LoginSignupForm: React.FC = () => {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login, register, state, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Effect to check for pre-filled username when switching to login form
  useEffect(() => {
    if (isLogin) {
      const lastRegisteredUsername = localStorage.getItem("lastRegisteredUsername");
      if (lastRegisteredUsername) {
        setLoginUsername(lastRegisteredUsername);
        // Clear the stored username
        localStorage.removeItem("lastRegisteredUsername");
      }
    }
  }, [isLogin]); // Run when isLogin changes

  const _handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(loginUsername, loginPassword);
  };

  const _handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const response = await register(registerUsername, registerPassword);
      if (response.success) {
        // Show success message
        setRegistrationSuccess(true);
        
        // Store username for pre-fill
        localStorage.setItem("lastRegisteredUsername", registerUsername);
        
        // Clear form
        setRegisterUsername("");
        setRegisterPassword("");
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
          setRegistrationSuccess(false);
          setIsLogin(true);
          // Set login username directly
          setLoginUsername(registerUsername);
        }, 2000);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-login">
      <div className={`wrapper${!isLogin ? ' active' : ''}`}>
        {/* Login Screen */}
        <div className="form-box login">
          <form onSubmit={_handleLoginSubmit}>
            <h1>Login</h1>

            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Username"
                required
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
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
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <button type="button" className="forgot-password-button">
                Forgot Password?
              </button>
            </div>

            <button type="submit">Login</button>

            {state.error && (
              <div className="error-message" style={{ display: 'block !important', color: 'red !important', background: 'white !important' }}>
                {state.error}
              </div>
            )}

            <div className="register-link">
              <p>
                Don't have an account ?{" "}
                <button type="button" onClick={() => setIsLogin(false)} className="link-button">
                  Register Now
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Screen */}
        <div className="form-box register">
          <form onSubmit={_handleRegister}>
            <h1>Registration</h1>

            {registrationSuccess ? (
              <div className="success-message" style={{ 
                color: '#28a745', 
                backgroundColor: '#d4edda', 
                border: '1px solid #c3e6cb',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}>
                Registration successful! Redirecting to login...
              </div>
            ) : (
              <>
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
                    <input type="checkbox" />
                    I agree to the terms & conditions
                  </label>
                </div>

                <button type="submit">Register</button>

                {state.error && (
                  <div className="error-message" style={{ 
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    padding: '10px',
                    marginTop: '15px',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    {state.error}
                  </div>
                )}
              </>
            )}

            <div className="register-link">
              <p>
                Have an account ?{" "}
                <button type="button" onClick={() => setIsLogin(true)} className="link-button">
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;
