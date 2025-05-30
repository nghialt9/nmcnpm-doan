import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { RiAccountBoxFill, RiLogoutBoxRFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../providers/AuthContext";

// Add your logo image (if needed)

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { state, logout: serviceLoggout } = useAuth();

  return (
    <Navbar bg="#7ab2b2" expand="lg" style={{ background: "#7ab2b2" }}>
      <Container style={{ maxHeight: "64px" }}>
        <Navbar.Brand
          style={{ fontSize: "3rem", fontWeight: "bold", color: "orange" }}
          href="/"
        >
          MindForge
        </Navbar.Brand>
        {/* Add logo if desired */}
        {/* <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        Signed in as: User Name
                    </Navbar.Text>
                </Navbar.Collapse> */}
        {state.user?.username && (
          <div style={{ display: 'flex', alignItems: 'right', color: 'white', marginRight: '20px' }}>
            <RiAccountBoxFill size={30} color="white" />
            <span style={{ fontSize: '20px' }}>Xin chào: {state.user.username}!</span>
          </div>
        )}
        <div className="logout">
          <RiLogoutBoxRFill size={30} color="white" />
          <button onClick={serviceLoggout}>Logout</button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
