import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../../providers/AuthContext";
import { Navigate } from "react-router-dom";

const LoginSignupForm: React.FC = () => {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const { register, state } = useAuth();

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    }
  }, [state]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerUsername, registerPassword);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const _handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterUsername(e.target.value);
  };

  const _handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterPassword(e.target.value);
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
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group controlId="registerUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={registerUsername}
                onChange={_handleUsernameChange}
              />
            </Form.Group>
            <Form.Group controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={_handleChangePassword}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Register
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginSignupForm;
