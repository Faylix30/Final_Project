import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Form, Row, Col, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './image/microscopeBG.jpg';
import loginImage from './image/logo.png';

export default function Login() {
    const [validated, setValidated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();

    const onLogin = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            doLogin();
        }
        setValidated(true);
    }

    // const doLogin = async () => {
    //     const user_data = { username: username, password: password };
    //     const response = await fetch("http://localhost:8080/login", {
    //         method: "POST",
    //         headers: {
    //             Accept: "application/json",
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(user_data)
    //     });
    //     const data = await response.json();
    //     if (data.result) {
    //         const authToken = (await getAuthenToken()).data.auth_token;
    //         const accessToken = (await getAccessToken(authToken, password)).data.access_token;
    //         localStorage.setItem("access_token", accessToken);
    //         navigate("/home");
    //     } else {
    //         alert('Login failed: ' + data.message);
    //     }
    // }

    const doLogin = async () => {
        const user_data = { username: username, password: password };
        const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user_data)
        });
        const data = await response.json();

        console.log(data);  // This will show the entire response, including the user and role

        if (data.result) {
            const authToken = (await getAuthenToken()).data.auth_token;
            const accessToken = (await getAccessToken(authToken, password)).data.access_token;
            localStorage.setItem("access_token", accessToken);

            // Store the user role if available
            if (data.user && data.user.role) {
                localStorage.setItem("user_role", data.user.role);
            } else {
                console.error('User role is missing in the response');
            }

            navigate("/home");
        }
        else {
            alert('Login failed: ' + data.message);
        }
    }

    const getAuthenToken = async () => {
        const response = await fetch("http://localhost:8080/api/authen_request", {
            method: "POST",
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });
        return await response.json();
    }

    const getAccessToken = async (authToken, password) => {
        const response = await fetch("http://localhost:8080/api/access_request", {
            method: "POST",
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, auth_token: authToken })
        });
        return await response.json();
    }

    return (
        <Container fluid style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(to right, #bfddf0, #80a3d4)' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '3rem', textAlign: 'center', marginBottom: '20px' }}>Login</h1>
            <Row className="w-100" style={{ maxWidth: '900px', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', overflow: 'hidden', backgroundColor: '#ffffff' }}>

                {/* ส่วนที่มีรูปพื้นหลัง */}
                <Col
                    md={6}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative', // ทำให้สามารถใช้ overlay ภายใน Col ได้
                    }}
                >
                    {/* การสร้าง overlay เพื่อทำให้พื้นหลังมืดลง */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1,
                        }}
                    ></div>

                    {/* ข้อความอยู่เหนือ overlay */}
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingLeft: '20px',
                            height: '100%',
                        }}
                    >
                        <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                            Welcome to Dermatology Diagnosis Application
                        </h2>
                    </div>
                </Col>

                {/* ส่วนของฟอร์มล็อกอิน */}
                <Col md={6} className="d-flex flex-column justify-content-center p-5">
                    {/* แสดงรูปภาพแทนคำว่า Login */}
                    <div className="text-center mb-4">
                        <img src={loginImage} alt="Login" style={{ maxWidth: '350px' }} />
                    </div>
                    <Form noValidate validated={validated} onSubmit={onLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter your username"
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ padding: '10px', fontSize: '1.1rem' }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ padding: '10px', fontSize: '1.1rem' }}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            style={{
                                padding: '10px',
                                fontSize: '1.2rem',
                                backgroundColor: '#007bff',
                                border: 'none',
                                borderRadius: '5px',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
                        >
                            Login
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );

}
