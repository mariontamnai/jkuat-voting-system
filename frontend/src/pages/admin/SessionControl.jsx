import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  startSession,
  endSession,
  publishResults,
} from '../../services/adminService';

const SessionControl = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [phase, setPhase] = useState(
    sessionStorage.getItem('adminPhase') || 'idle'
  );

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const handleStartSession = async () => {
    const result = await startSession();

    if (result.success) {
      setPhase('voting');

      sessionStorage.setItem('adminPhase', 'voting');
      sessionStorage.setItem('sessionStatus', 'active');

      showMessage('Session started successfully!', 'success');
    } else {
      showMessage(
        result.message || 'Failed to start session',
        'error'
      );
    }
  };

  const handleEndSession = async () => {
    const result = await endSession();

    if (result.success) {
      setPhase('counting');

      sessionStorage.setItem('adminPhase', 'counting');
      sessionStorage.setItem('sessionStatus', 'ended');

      showMessage('Session ended successfully!', 'success');
    } else {
      showMessage(
        result.message || 'Failed to end session',
        'error'
      );
    }
  };

  const handlePublishResults = async () => {
    const result = await publishResults();

    if (result.success) {
      setPhase('published');

      sessionStorage.setItem('adminPhase', 'published');
      sessionStorage.setItem('resultsPublished', 'true');

      showMessage('Results published successfully!', 'success');

      setTimeout(() => {
        navigate('/winner');
      }, 1500);
    } else {
      showMessage(
        result.message || 'Failed to publish results',
        'error'
      );
    }
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>Session Control</h2>

            <p className="helper-text">
              Manage the voting lifecycle
            </p>

            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            <div className="phase-badge">
              Phase: {phase}
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title">
                Voting Session
              </h3>

              <div className="button-group">
                <button
                  className="btn btn-primary"
                  onClick={handleStartSession}
                  disabled={phase !== 'idle'}
                >
                  START VOTING SESSION
                </button>

                <button
                  className="btn btn-outline"
                  onClick={handleEndSession}
                  disabled={phase !== 'voting'}
                >
                  END VOTING SESSION
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handlePublishResults}
                  disabled={phase !== 'counting'}
                >
                  PUBLISH RESULTS
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SessionControl;