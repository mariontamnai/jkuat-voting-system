import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResultBar from '../components/ResultBar';
import { getResults } from '../services/voteService';

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadResults();
    const interval = setInterval(() => {
      loadResults();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadResults = async () => {
    const result = await getResults();
    if (result.success) {
      setResults(result.results);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) return 5;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>Live Election Results</h2>
            <p className="live-indicator"> LIVE — Auto-updating every 5 seconds</p>

            {loading ? (
              <div className="loading-text">Loading results...</div>
            ) : (
              <>
                {results?.candidates[0] && (
                  <div className="current-leader">
                    <p className="leader-label">CURRENT LEADER</p>
                    <h3>{results.candidates[0].name}</h3>
                    <p>{results.candidates[0].votes} votes ({results.candidates[0].percentage}%)</p>
                  </div>
                )}

                <div className="stats-grid">
                  <div className="stat-box">
                    <h3>{results?.totalVotes}</h3>
                    <p>TOTAL VOTES</p>
                  </div>
                  <div className="stat-box">
                    <h3>{results?.turnout}%</h3>
                    <p>VOTER TURNOUT</p>
                    <span>of {results?.eligibleVoters} eligible</span>
                  </div>
                  <div className="stat-box">
                    <h3>{results?.eligibleVoters}</h3>
                    <p>ELIGIBLE VOTERS</p>
                  </div>
                </div>

                <h3 className="section-title">Vote Distribution</h3>
                <div className="section-divider" />

                <div className="results-list">
                  {results?.candidates.map((candidate, index) => (
                    <ResultBar
                      key={candidate.id}
                      candidate={candidate}
                      rank={index + 1}
                      isLeader={index === 0}
                    />
                  ))}
                </div>

                <div className="results-footer">
                  <div className="results-footer-row">
                    <span>Last Updated:</span>
                    <span>{formatTime(lastUpdated)}</span>
                  </div>
                  <div className="results-footer-row">
                    <span>Next Refresh:</span>
                    <span>In {countdown} seconds</span>
                  </div>
                  <div className="results-footer-row">
                    <span>Status:</span>
                    <span className="live-status">Live</span>
                  </div>
                </div>

                <div className="button-group" style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/vote')}
                  >
                    BACK TO VOTING
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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Results;