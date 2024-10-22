import React, { useState, useEffect } from 'react';
import logo from './image/logo.png';
import userProfile from './image/user-profile.png';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

function CustomNavbar() {

    const navigate = useNavigate();
    const [bgColor, setBgColor] = useState('#010b5b');
    const [textColor, setTextColor] = useState('#fff');
    const [hoverTextColor, setHoverTextColor] = useState('#ff6347');
    const [dropdownBgColor, setDropdownBgColor] = useState('#010b5b');
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Retrieve user role from localStorage
        const storedRole = localStorage.getItem("user_role");
        setUserRole(storedRole);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");  // Clear the user role on logout
        navigate("/");
    };

    return (
        <>
            <Navbar style={{ backgroundColor: bgColor }} variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/home">
                        <img src={logo} alt="Logo" style={{ height: '40px' }} />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/home"
                                style={{
                                    color: textColor,
                                    position: 'relative',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                className="nav-link-custom"
                            >
                                Home
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/image-processing"
                                style={{
                                    color: textColor,
                                    position: 'relative',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                className="nav-link-custom"
                            >
                                Image Processing
                            </Nav.Link>

                            {/* Only show this link if the user role is Admin */}
                            {userRole === '1' && (
                                <Nav.Link
                                    as={Link}
                                    to="/prediction-history"
                                    style={{
                                        color: textColor,
                                        position: 'relative',
                                        textDecoration: 'none',
                                        transition: 'color 0.3s ease'
                                    }}
                                    className="nav-link-custom"
                                >
                                    Prediction history
                                </Nav.Link>
                            )}
                        </Nav>
                        <Nav>
                            <NavDropdown
                                title={<img src={userProfile} alt="User Profile" style={{ height: '30px' }} />}
                                id="basic-nav-dropdown"
                                style={{ backgroundColor: dropdownBgColor }}
                            >
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <style type="text/css">
                {`
                    .nav-link-custom:hover {
                        color: ${hoverTextColor} !important;
                        text-decoration: underline !important;
                    }
                `}
            </style>
        </>
    );
}

export default CustomNavbar;
