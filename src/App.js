import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ImageProcessing from './ImageProcessing';
import Home from './Home';
import Login from './login';
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

function App() {
  const location = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100">
      {location.pathname !== "/" && <Navbar />}
      <Container className="flex-grow-1 mt-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/image-processing" element={<ImageProcessing />} />
        </Routes>
      </Container>
      
      <footer className="bg-dark text-white text-center py-3 mt-4">
        <Container>
          <p>2024 Reliance Industries Limited. All rights reserved</p>
        </Container>
      </footer>
    </div>
  );
}

export default function RouterWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
