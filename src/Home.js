import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import bannerImage from './image/BG.jpeg';

export default function Home() {
    let navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            navigate("/");
        }
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div style={{
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '70vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                {/* Overlay Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                }}></div>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    zIndex: 2,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
                }}>
                    DERMATOLOGY DIAGNOSIS APPLICATION
                </h1>
            </div>

            {/* Divider */}
            <hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />

            {/* Content Section */}
            <Container className="text-center mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <p style={{
                            fontSize: '1.0rem',
                            lineHeight: '1.6',
                            fontWeight: 'normal',
                            textAlign: 'center',
                            marginBottom: '40px',
                            color: '#333'
                        }}>
                            A machine learning-based tool for rapid, accurate detection and differentiation of skin conditions. 
                            Our aim is to provide actionable insights for improving skin health and automating the monitoring process.
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
