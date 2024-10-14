import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ImageProcessing from './ImageProcessing';
import Home from './Home';
import Login from './login';

function App() {
  return (
    <Router>
      <div>
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/image-processing" element={<ImageProcessing />} />
          </Routes>
        </main>
        <footer>
          <p>2024 Reliance Industries Limited. All rights reserved</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
