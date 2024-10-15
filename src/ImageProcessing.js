import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function ImageProcessing() {
  let navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/");
    }
  }, []);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);  // รับหลายไฟล์จาก input
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);  // เก็บไฟล์ใน state
    } else {
      setFiles([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images[]', file);  // แนบหลายไฟล์ใน images[]
    });

    try {
      const response = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem("access_token")
        }
      });

      if (response.data.result) {
        console.log('Upload result:', response.data);
        setResults(response.data.predictions || []);  // รับผล predict
        setFiles([]);
        fileInputRef.current.value = null;
      } else {
        console.error('Upload error:', response.data.message);
        alert('Failed to upload images.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="card">
          <div className="card-header">
            <h2>Image Processing</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="imageInput">Select Images</label>
                <input
                  type="file"
                  className="form-control-file"
                  id="imageInput"
                  multiple  // เลือกหลายไฟล์
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {files && files.length > 0 && (
                  <ul className="mt-2">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3">
                <Button variant="primary" size="lg" type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              </div>
            </form>
          </div>
        </div>
        {results && results.length > 0 && (
          <div className="mt-5">
            <h3>Results:</h3>
            <ul>
              {results.map((result, index) => (
                <li key={index}>
                  <strong>{result.file}</strong>: Prediction - {result.prediction}
                  <div>
                    {/* แสดงรูปภาพจาก base64 */}
                    <img src={`data:image/jpeg;base64,${result.image_base64}`} alt="Uploaded" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
