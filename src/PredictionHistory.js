import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Form } from 'react-bootstrap';

function PredictionHistory() {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');

        axios.get(`http://localhost:8080/api/prediction-history`, {
            params: {
                user_id: userId
            }
        })
            .then(response => {
                if (response.data.result) {
                    setHistory(response.data.history);
                } else {
                    alert(response.data.message);
                }
            })
            .catch(error => {
                console.error("There was an error fetching the prediction history!", error);
            });
    }, []);

    const handleDelete = (image_id) => {
        if (window.confirm('Are you sure you want to delete this history?')) {
            axios.delete(`http://localhost:8080/api/delete-history/${image_id}`)
                .then(response => {
                    if (response.data.result) {
                        setHistory(history.filter(item => item.image_id !== image_id));
                    } else {
                        alert('Failed to delete');
                    }
                })
                .catch(error => {
                    console.error("There was an error deleting the history!", error);
                });
        }
    };

    // Filter history based on search query
    const filteredHistory = history.filter(entry =>
        entry.image_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Prediction History</h2>

            {/* Search Bar */}
            <Form.Group className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by image name"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}  // Update search query
                />
            </Form.Group>

            {filteredHistory.length === 0 ? (
                <p className="text-center">No matching prediction history found.</p>
            ) : (
                <Row>
                    {filteredHistory.map((entry, index) => (
                        <Col md={6} lg={4} className="mb-4" key={index}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <Card.Title><strong>Image Name:</strong> {entry.image_name}</Card.Title>
                                    <Card.Text>
                                        <strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Predictions:</strong>
                                        <ul>
                                            {entry.predictions.map((prediction, i) => (
                                                <li key={i}>
                                                    {prediction.class_name}: {prediction.probability}%
                                                </li>
                                            ))}
                                        </ul>
                                    </Card.Text>
                                    <Button variant="danger" onClick={() => handleDelete(entry.image_id)}>
                                        Delete
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}

export default PredictionHistory;
