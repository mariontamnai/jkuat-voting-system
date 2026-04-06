import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VoteSubmitted = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [votedFor, setVotedFor] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    const storedVote = JSON.parse(sessionStorage.getItem('votedFor'));

    if (!storedUser || !token) {
      navigate('/student-login');
      return;
    }

    setUser(storedUser);
    setVotedFor(storedVote);
  }, []);

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            {/* Voter Info */}
            <div className="voter-info">
              <div className="voter-info-row">
                <span className="voter-info-label">Voter ID</span>
                <span className="voter-info-value">
                  ****{user?.regNo?.slice(-4)}
                </span>
              </div>
              <div className="voter-info-row">
                <span className="voter-info-label">Session Token</span>
                <span className="voter-info-value">
                  ****{token?.slice(-6)}
                </span>
              </div>
              <div className="voter-info-row">
                <span className="voter-info-label">Vote Status</span>
                <span className="vote-status voted">VOTED</span>
              </div>
            </div>

            {/* Success message */}
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2>Your vote has been submitted</h2>
              <p className="description">
                Thank you for participating in the election. Your vote has been securely recorded.
              </p>

              {votedFor && (
                <div className="voted-for">
                  You voted for: <strong>{votedFor.name}</strong>
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                className="btn btn-outline"
                onClick={() => navigate('/results')}
              >
                VIEW FINAL RESULTS
              </button>

              <button
                className="btn btn-danger"
                onClick={() => {
                  sessionStorage.clear();
                  navigate('/');
                }}
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VoteSubmitted;