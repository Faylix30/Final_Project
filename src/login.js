// import 'bootstrap/dist/css/bootstrap.min.css';
// import { useState } from 'react';
// import { Form, Row, Col, Button, Container, Card } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import microscopeBGImage from './image/microscopeBG.jpg';
// import logo from './image/logo.png';

// export default function Login() {

//     const [validated, setValidated] = useState(false);
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     let navigate = useNavigate();

//     const onLogin = (event) => {
//         const form = event.currentTarget;
//         event.preventDefault();

//         if (form.checkValidity() === false) {
//             event.stopPropagation();
//         } else {
//             doLogin();
//         }

//         setValidated(true);
//     }

//     const doLogin = async () => {
//         const user_data = { username: username, password: password }
//         console.log(user_data)
//         const response = await fetch(
//             "http://localhost:8080/login",
//             {
//                 method: "POST",
//                 headers: {
//                     Accept: "application/json",
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     username: username,
//                     password: password
//                 })
//             }
//         );
        
//         const data = await response.json();

//         if (data.result) {
//             const data1 = await getAuthenToken();
//             const authToken = data1.data.auth_token;
//             const data2 = await getAccessToken(authToken, password);
//             localStorage.setItem("access_token", data2.data.access_token);
//             localStorage.setItem("user_id", data2.data.account_info.user_id);
//             localStorage.setItem("user_name", username);
//             localStorage.setItem("first_name", data2.data.account_info.first_name);
//             localStorage.setItem("last_name", data2.data.account_info.last_name);

//             navigate("home", { replace: false });
//         } else {
//             console.error("Login failed:", data.message);
//         }
//     }

//     const getAuthenToken = async () => {
//         const response = await fetch(
//             "http://localhost:8080/api/authen_request",
//             {
//                 method: "POST",
//                 headers: {
//                     Accept: "application/json",
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     username: username
//                 })
//             }
//         );

//         const data = await response.json(); 
//         return data;
//     }

//     const getAccessToken = async (authToken, password) => {
//         const response = await fetch(
//             "http://localhost:8080/api/access_request",
//             {
//                 method: "POST",
//                 headers: {
//                     Accept: "application/json",
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     password: password,
//                     auth_token: authToken
//                 })
//             }
//         );

//         const data = await response.json();
//         return data;
//     }

//     return (
//         <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '93.9vh', backgroundColor: '#c7e8ff' }}>
//             <Card className="shadow" style={{ width: '900px', maxWidth: '100%' }}>
//                 <Row>
//                     <Col md={6} className="d-none d-md-block" style={{
//                         backgroundImage: `url(${microscopeBGImage})`,
//                         backgroundSize: 'cover',
//                         backgroundPosition: 'center',
//                         color: 'white',
//                         padding: '20px',
//                         textAlign: 'center'
//                     }}>
//                         <h1>ยินดีต้อนรับ</h1>
//                         <p>เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน</p>
//                     </Col>
//                     <Col md={6} className="p-4">
//                     <img src={logo} alt="Logo" className="mb-3" style={{ maxWidth: '100%', height: 'auto' }} />
//                         <h2>เข้าสู่ระบบ</h2>
//                         <Form noValidate validated={validated} onSubmit={onLogin}>
//                             <Form.Group className="mb-3" controlId="validationCustom01">
//                                 <Form.Label>ชื่อผู้ใช้</Form.Label>
//                                 <Form.Control
//                                     required
//                                     type="text"
//                                     placeholder="ชื่อผู้ใช้"
//                                     onChange={(e) => setUsername(e.target.value)}
//                                 />
//                             </Form.Group>
//                             <Form.Group className="mb-3" controlId="validationCustom02">
//                                 <Form.Label>รหัสผ่าน</Form.Label>
//                                 <Form.Control
//                                     required
//                                     type="password"
//                                     placeholder="รหัสผ่าน"
//                                     onChange={(e) => setPassword(e.target.value)}
//                                 />
//                             </Form.Group>
//                             <Button variant="primary" type="submit" className="w-100">เข้าสู่ระบบ</Button>
//                         </Form>
//                     </Col>
//                 </Row>
//             </Card>
//         </Container>
//     );
// }

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Form, Row, Col, Button, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import microscopeBGImage from './image/microscopeBG.jpg';
import logo from './image/logo.png';

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
        const user_data = { username: username, password: password }
        console.log(user_data)
        const response = await fetch(
            "http://localhost:8080/login",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );
        
        const data = await response.json();

        if (data.result) {
            // รับ JWT token จากการยืนยันตัวตน
            const data1 = await getAuthenToken();
            const authToken = data1.data.auth_token;

            // รับ Access Token โดยใช้ JWT
            const data2 = await getAccessToken(authToken, password);
            localStorage.setItem("access_token", data2.data.access_token);
            localStorage.setItem("user_id", data2.data.account_info.user_id);
            localStorage.setItem("user_name", username);
            localStorage.setItem("first_name", data2.data.account_info.first_name);
            localStorage.setItem("last_name", data2.data.account_info.last_name);

            // นำทางไปยังหน้า Home
            navigate("/home", { replace: false });
        } else {
            console.error("Login failed:", data.message);
            alert('Login failed: ' + data.message);
        }
    }

    const getAuthenToken = async () => {
        const response = await fetch(
            "http://localhost:8080/api/authen_request",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username
                })
            }
        );

        const data = await response.json(); 
        return data;
    }

    const getAccessToken = async (authToken, password) => {
        const response = await fetch(
            "http://localhost:8080/api/access_request",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                    auth_token: authToken
                })
            }
        );

        const data = await response.json();
        return data;
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '93.9vh', backgroundColor: '#c7e8ff' }}>
            <Card className="shadow" style={{ width: '900px', maxWidth: '100%' }}>
                <Row>
                    <Col md={6} className="d-none d-md-block" style={{
                        backgroundImage: `url(${microscopeBGImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <h1>ยินดีต้อนรับ</h1>
                        <p>เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน</p>
                    </Col>
                    <Col md={6} className="p-4">
                        <img src={logo} alt="Logo" className="mb-3" style={{ maxWidth: '100%', height: 'auto' }} />
                        <h2>เข้าสู่ระบบ</h2>
                        <Form noValidate validated={validated} onSubmit={onLogin}>
                            <Form.Group className="mb-3" controlId="validationCustom01">
                                <Form.Label>ชื่อผู้ใช้</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="ชื่อผู้ใช้"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="validationCustom02">
                                <Form.Label>รหัสผ่าน</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    placeholder="รหัสผ่าน"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">เข้าสู่ระบบ</Button>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}
