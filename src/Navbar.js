// import React from 'react';
// import logo from './image/logo.png';
// import userProfile from './image/user-profile.png';
// import { Link, useNavigate } from 'react-router-dom';
// import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
// import './Navbar.css';

// function CustomNavbar() {
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         localStorage.removeItem("access_token");
//         navigate("/");
//     };

//     return (
//         <Navbar className="navbar">
//             <Container>
//                 <Navbar.Brand as={Link} to="/home">
//                     <img src={logo} className="navbar-logo" alt="logo" />
//                 </Navbar.Brand>
//                 <h5 className="navbar-title">Dermatology Diagnosis Application</h5>
//                 <Navbar.Toggle aria-controls="basic-navbar-nav" />
//                 <Navbar.Collapse id="basic-navbar-nav">
//                     <Nav className="me-auto">
//                         <Nav.Link as={Link} to="/image-processing" className="navbar-button">Image Processing</Nav.Link>
//                     </Nav>
//                     <Nav className="user-profile-container">
//                         <NavDropdown title={<img src={userProfile} alt="User Profile" className="user-profile-image" />} id="basic-nav-dropdown">
//                             {/* <NavDropdown.Item as={Link} to="/profile">View Profile</NavDropdown.Item> */}
//                             <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
//                         </NavDropdown>
//                     </Nav>
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     );
// }

// export default CustomNavbar;

import React from 'react';
import logo from './image/logo.png';
import userProfile from './image/user-profile.png';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import './Navbar.css';

function CustomNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/");
    };

    return (
        <Navbar className="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/home">
                    <img src={logo} className="navbar-logo" alt="logo" />
                </Navbar.Brand>
                <h5 className="navbar-title">Dermatology Diagnosis Application</h5>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/image-processing" className="navbar-button">Image Processing</Nav.Link>
                    </Nav>
                    <Nav className="user-profile-container">
                        <NavDropdown title={<img src={userProfile} alt="User Profile" className="user-profile-image" />} id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default CustomNavbar;
