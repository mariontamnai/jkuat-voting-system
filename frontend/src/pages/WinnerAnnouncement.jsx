import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResultBar from '../components/ResultBar';
import { getResults } from '../services/voteService';

const WinnerAnnouncement = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const result = await getResults();
    if (result.success) {
      setResults(result.results);
    }
    setLoading(false);
  };

  const winner = results?.candidates[0];

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          {loading ? (
            <div className="loading-text">Loading results...</div>
          ) : (
            <div className="card">
              <div className="official-badge"> OFFICIAL RESULTS</div>

              <div className="winner-container">
                <div className="trophy">🏆</div>
                <p className="winner-label">WINNER</p>
                <h2 className="winner-name">{winner?.name}</h2>
                <p className="winner-faculty">{winner?.faculty}</p>

                <div className="winner-stats">
                  <div className="winner-stat">
                    <h3>{winner?.votes}</h3>
                    <p>VOTES</p>
                  </div>
                  <div className="winner-stat">
                    <h3>{winner?.percentage}%</h3>
                    <p>OF VOTES</p>
                  </div>
                  <div className="winner-stat">
                    <h3>{results?.turnout}%</h3>
                    <p>TURNOUT</p>
                  </div>
                </div>
              </div>

              <div className="section-divider" />
              <h3 className="section-title">Final Results</h3>
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

              <div className="final-stats">
                <div className="final-stats-row">
                  <span>Total Votes Cast</span>
                  <span><strong>{results?.totalVotes}</strong></span>
                </div>
                <div className="final-stats-row">
                  <span>Eligible Voters</span>
                  <span><strong>{results?.eligibleVoters}</strong></span>
                </div>
                <div className="final-stats-row">
                  <span>Voter Turnout</span>
                  <span><strong>{results?.turnout}%</strong></span>
                </div>
                <div className="final-stats-row">
                  <span>Election Status</span>
                  <span className="official-text"><strong>OFFICIAL</strong></span>
                </div>
              </div>

              <div className="button-group" style={{ marginTop: '20px' }}>
                {JSON.parse(sessionStorage.getItem('admin')) && (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    BACK TO DASHBOARD
                  </button>
                )}
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WinnerAnnouncement;