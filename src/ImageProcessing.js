import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import axios from 'axios';
import { Button, Spinner, ProgressBar } from 'react-bootstrap';

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);
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
      formData.append('images[]', file);
    });

    try {
      const response = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem("access_token")
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.result) {
        setResults(response.data.predictions || []);
        setFiles([]);
        fileInputRef.current.value = null;
      } else {
        alert('Failed to upload images.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="container my-5">
        <div className="card shadow-lg border-0 rounded-lg">
          <div className="card-header bg-primary text-white">
            <h2 className="text-center">Image Processing</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="imageInput" className="font-weight-bold">Select Images : </label>
                <input
                  type="file"
                  className="form-control-file"
                  id="imageInput"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {files && files.length > 0 && (
                  <ul className="mt-3 list-group">
                    {files.map((file, index) => (
                      <li key={index} className="list-group-item bg-light border-0">
                        <i className="fa fa-file-image-o mr-2"></i>{file.name}
                      </li>
                    ))}
                  </ul>
                )}

              </div>
              <div className="mt-4">
                <Button variant="success" size="lg" type="submit" disabled={uploading} style={{ width: '250px' }}>
                  {uploading ? <Spinner animation="border" size="m" /> : 'Upload Images'}
                </Button>
              </div>
              {uploading && (
                <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-3 bg-success" />
              )}
            </form>
          </div>
        </div>
        {results && results.length > 0 && (
          <div className="mt-5 p-3" style={{ backgroundColor: '#d8eaff', borderRadius: '10px' }}>
            <h3 style={{ color: 'black', fontWeight: 'bold' }}>Result:</h3>
            <div className="row">
              {results.map((result, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="list-group-item bg-white shadow-sm rounded-lg p-3" style={{ height: '100%' }}>
                    <div className="image-container text-center" style={{ height: '200px', overflow: 'hidden' }}>
                      <img
                        src={`data:image/jpeg;base64,${result.image_base64}`}
                        alt="Uploaded"
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                        className="img-thumbnail"
                      />
                    </div>
                    <ul className="mt-3" style={{ display: 'inline-block' }}>
                      {result.prediction_results.map((prediction, i) => (
                        <li key={i}>
                          {prediction.class}: {prediction.probability}%
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
