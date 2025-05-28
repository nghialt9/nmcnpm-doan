import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";

// Import your header and chat components (created later)
// import Header from "../components/Header"; // Adjust path as needed
// import { Container, Row, Col } from "react-bootstrap";
// import AppNavigation from "../components/AppNavigation";

const PrivateRoute: React.FC = () => {
  const { state } = useAuth();
  console.log("PrivateRoute", state?.isAuthenticated);

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    } else {
      console.log("User is not authenticated", state);
    }
  }, [state]);

  return state?.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;

  // return state?.isAuthenticated ? (
  //   <Container className="vh-100 px-0" fluid={true}>
  //     <Header />
  //     <Row>
  //       <Col sm={3} style={{ padding: 20 }}>
  //         <AppNavigation />
  //       </Col>
  //       <Col sx={9} md={9}>
  //         <Outlet />
  //       </Col>
  //     </Row>
  //   </Container>
  // ) : (
  //   <Navigate to="/login" />
  // );
};

export default PrivateRoute;
