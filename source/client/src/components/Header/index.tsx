import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { RiAccountBoxFill, RiLogoutBoxRFill } from "react-icons/ri";
import { useAuth } from "../../providers/AuthContext";
import "./index.css";
interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { state, logout: serviceLoggout } = useAuth();

  return (
    // Sử dụng className thay vì inline style
    <Navbar className="app-header" expand="lg"> 
      <Container>
        <Navbar.Brand className="app-logo" href="/">
          SpeakSphere
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {state.user?.username && (
            <div className="user-info">
              <RiAccountBoxFill size={24} />
              <span>Xin chào, {state.user.username}!</span>
            </div>
          )}
          <div className="logout-section">
            <RiLogoutBoxRFill size={24} />
            <button onClick={serviceLoggout} className="logout-button">
              Logout
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;