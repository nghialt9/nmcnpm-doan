import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../../providers/AuthContext";
import { Navigate } from "react-router-dom";

const LoginSignupForm: React.FC = () => {
  const [loginUsername, setLoginUsername] = useState("user");
  const [loginPassword, setLoginPassword] = useState("password");
  const { register, state } = useAuth();

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    }
  }, [state]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(loginUsername, loginPassword);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const _handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginUsername(e.target.value);
  };

  const _handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
  };

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container
      className="flex align-content-center"
      style={{ height: "100vh" }}
    >
      <Row className="flex align-content-center" style={{ maxWidth: 600 }}>
        <Col style={{ minWidth: 480 }}>
          <h2>Register</h2>
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={loginUsername}
                onChange={_handleUsernameChange}
              />
            </Form.Group>
            <Form.Group controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={_handleChangePassword}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginSignupForm;
