import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import config from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [electionStatus, setElectionStatus] = useState(null);
  const [electionId, setElectionId] = useState(null);

  useEffect(() => {
    checkElectionStatus();
  }, []);

  const checkElectionStatus = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/admin/elections`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // find active or completed election
        const active = data.find(e => e.status === 'active');
        const completed = data.find(e => e.status === 'completed');
        if (active) {
          setElectionStatus('active');
          setElectionId(active._id);
        } else if (completed) {
          setElectionStatus('completed');
          setElectionId(completed._id);
        }
      }
    } catch (err) {
      console.error('Election status check failed:', err);
    }
  };

  const handleViewResults = () => {
    sessionStorage.setItem('electionId', electionId);
    navigate('/results');
  };

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

            {electionStatus === 'active' && (
              <div className="alert alert-success" style={{ marginBottom: '15px' }}>
                🗳️ Voting is currently open!
              </div>
            )}

            {electionStatus === 'completed' && (
              <div className="alert alert-success" style={{ marginBottom: '15px' }}>
                ✅ Election has ended. Results are available!
              </div>
            )}

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

              {(electionStatus === 'active' || electionStatus === 'completed') && (
                <button
                  className="btn btn-outline"
                  onClick={handleViewResults}
                >
                  VIEW ELECTION RESULTS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;