import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import backgroundImage from './image/BG.jpeg';

export default function Home() {
    let navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            navigate("/");
        }
    }, []);

    return (
        <div>
            <Container className="text-center mt-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <h1 className="display-4">Welcome to the Dermatology Diagnosis Application</h1>
                        <p className="lead mt-4">
                            This machine learning-based application provides rapid and accurate detection of skin conditions.
                            Let our AI help monitor and provide actionable insights to improve overall skin health.
                        </p>
                    </Col>
                </Row>
            </Container>

        </div>

    );
}
