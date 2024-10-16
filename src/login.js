import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Form, Row, Col, Button, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './image/microscopeBG.jpg';

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
        if (data.result) {
            const authToken = (await getAuthenToken()).data.auth_token;
            const accessToken = (await getAccessToken(authToken, password)).data.access_token;
            localStorage.setItem("access_token", accessToken);
            navigate("/home");
        } else {
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
        <Container fluid style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Row className="w-100" style={{ maxWidth: '1200px', height: '80%', backgroundColor: '#c7e8ff', borderRadius: '20px', overflow: 'hidden' }}>
                <Col md={6} style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                </Col>
                <Col md={6} className="d-flex flex-column justify-content-center p-5">
                    <h3 className="text-center mb-4">Login</h3>
                    <Form noValidate validated={validated} onSubmit={onLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter your username"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );

}
