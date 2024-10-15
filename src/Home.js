import React from 'react';
import hospitalImage from './image/BG.jpeg';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import './Home.css';

export default function Home() {

    let navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            navigate("/");
        }
    }, [])

    return (
        <>
            <Navbar />
            <div className="container-fluid p-0">
                <div className="row no-gutters">
                    <div className="col-12">
                        <img src={hospitalImage} alt="Hospital" className="img-fluid w-100 hospital-image" />
                    </div>
                    <div className="col-12 text-center py-5" style={{ backgroundColor: '#f7f7f7' }}>
                        <h2 className="display-6 font-weight-bold">DERMATOLOGY DIAGNOSIS APPLICATION</h2>
                        <p className="lead">
                            This is a machine learning based rapid, accurate detection and differentiation of
                            undesirable organisms. The application provides potentially useful early warning signs of
                            deteriorating conditions with the ultimate aim to automate health monitoring and decision-making.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
