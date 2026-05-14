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
  const [countdown, setCountdown] = useState(5);
  const [sessionEnded, setSessionEnded] = useState(
    sessionStorage.getItem('sessionStatus') === 'ended'
  );

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    loadResults();
    const interval = setInterval(() => {
      const status = sessionStorage.getItem('sessionStatus');
      if (status === 'ended') {
        setSessionEnded(true);
        clearInterval(interval);
        return;
      }
      loadResults();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionEnded) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) return 5;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionEnded]);

  const loadResults = async () => {
  const result = await getResults();
  if (result.success) {
    setResults(result.results);
    setLastUpdated(new Date());
    // check election status from backend
    if (result.electionStatus === 'completed') {
      setSessionEnded(true);
      sessionStorage.setItem('sessionStatus', 'ended');
    }
  }
  setLoading(false);
};

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>Live Election Results</h2>
            <p className="live-indicator">
              {sessionEnded
                ? ' Session Ended — Final Results'
                : ' LIVE — Auto-updating every 5 seconds'}
            </p>

            {loading ? (
              <div className="loading-text">Loading results...</div>
            ) : (
              <>
                {results?.candidatesByPosition && Object.entries(results.candidatesByPosition).map(([position, candidates]) => (
  <div key={position} className="current-leader" style={{ marginBottom: '10px' }}>
    <p className="leader-label">LEADING — {position}</p>
    <h3>{candidates[0].name}</h3>
    <p>{candidates[0].votes} votes ({candidates[0].percentage}%)</p>
  </div>
))}

                <div className="stats-grid">
                  <div className="stat-box">
                    <h3>{results?.totalVotes}</h3>
                    <p>VOTERS PARTICIPATED</p>
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

{results?.candidatesByPosition 
  ? Object.entries(results.candidatesByPosition).map(([position, candidates]) => (
    <div key={position} style={{ marginBottom: '20px' }}>
      <h4 style={{ color: '#2d6a4f', marginBottom: '10px' }}>{position}</h4>
      <div className="results-list">
        {candidates.map((candidate, index) => (
          <ResultBar
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            isLeader={index === 0}
          />
        ))}
      </div>
    </div>
  ))
  : (
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
  )
}

                <div className="results-footer">
                  <div className="results-footer-row">
                    <span>Last Updated:</span>
                    <span>{formatTime(lastUpdated)}</span>
                  </div>
                  <div className="results-footer-row">
                    <span>Next Refresh:</span>
                    <span>{sessionEnded ? 'Stopped' : `In ${countdown} seconds`}</span>
                  </div>
                  <div className="results-footer-row">
                    <span>Status:</span>
                    <span className={sessionEnded ? 'ended-status' : 'live-status'}>
                      {sessionEnded ? 'Ended' : 'Live'}
                    </span>
                  </div>
                </div>

                <div className="button-group" style={{ marginTop: '20px' }}>
  {admin && (
    <button
      className="btn btn-primary"
      onClick={() => navigate('/admin/dashboard')}
    >
      BACK TO DASHBOARD
    </button>
  )}
  {!admin && (
    <button
      className="btn btn-outline"
      onClick={() => navigate('/')}
    >
      BACK TO HOME
    </button>
  )}
  <button
    className="btn btn-danger"
    onClick={() => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('votingToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('votedFor');
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