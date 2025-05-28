import React, { Fragment } from "react";
import { NavItem, Nav } from "react-bootstrap";

import { useAuth } from "../../providers/AuthContext";

interface AppNavigationProps {}

const AppNavigation: React.FC<AppNavigationProps> = () => {
  const { logout, state } = useAuth();
  return (
    <Nav className="flex flex-column">
      <NavItem>
        <Nav.Link>{JSON.stringify(state?.user?.username)}</Nav.Link>
        <Nav.Link>{JSON.stringify(state?.user?.uuid)}</Nav.Link>
      </NavItem>
      {!state.isAuthenticated && (
        <Fragment>
          <NavItem>
            <Nav.Link href="/login">login</Nav.Link>
          </NavItem>
          <NavItem>
            <Nav.Link href="/register">register</Nav.Link>
          </NavItem>
        </Fragment>
      )}
      {state.isAuthenticated && (
        <NavItem>
          <Nav.Link onClick={logout}>logout</Nav.Link>
        </NavItem>
      )}
    </Nav>
  );
};

export default AppNavigation;
