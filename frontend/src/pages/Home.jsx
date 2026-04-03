import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="badges">
            <span className="badge">AES-256 Encrypted</span>
            <span className="badge">Biometric Verified</span>
            <span className="badge">One Person, One Vote</span>
          </div>

          <div className="card">
            <h2>Welcome to JKUSA Student Leaders Election</h2>
            <p className="description">
              A secure biometric-based online voting platform for JKUSA student
              elections. Identity verification is performed using facial recognition
              and AES-256 encryption before vote submission.
            </p>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/student-login')}
              >
                STUDENT LOGIN
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin-login')}
              >
                ADMIN LOGIN
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;