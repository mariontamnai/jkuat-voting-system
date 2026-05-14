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
              <div className="official-badge">OFFICIAL RESULTS</div>

              {/* Winner per position */}
              {results?.candidatesByPosition 
                ? Object.entries(results.candidatesByPosition).map(([position, candidates]) => {
                    const winner = candidates[0];
                    const positionTotalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
                    const winnerPercentage = positionTotalVotes > 0 
                      ? parseFloat(((winner.votes / positionTotalVotes) * 100).toFixed(1)) 
                      : 0;
                    return (
                      <div key={position} className="winner-container" style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <div className="trophy">🏆</div>
                        <p className="winner-label">WINNER — {position}</p>
                        <h2 className="winner-name">{winner?.name}</h2>
                        <p className="winner-faculty">{position}</p>
                        <div className="winner-stats">
                          <div className="winner-stat">
                            <h3>{winner?.votes}</h3>
                            <p>VOTES</p>
                          </div>
                          <div className="winner-stat">
                            <h3>{winnerPercentage}%</h3>
                            <p>OF VOTES</p>
                          </div>
                          <div className="winner-stat">
                            <h3>{results?.turnout}%</h3>
                            <p>TURNOUT</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : (
                  <div className="winner-container">
                    <div className="trophy">🏆</div>
                    <p className="winner-label">WINNER</p>
                    <h2 className="winner-name">{results?.candidates[0]?.name}</h2>
                    <div className="winner-stats">
                      <div className="winner-stat">
                        <h3>{results?.candidates[0]?.votes}</h3>
                        <p>VOTES</p>
                      </div>
                      <div className="winner-stat">
                        <h3>{results?.candidates[0]?.percentage}%</h3>
                        <p>OF VOTES</p>
                      </div>
                      <div className="winner-stat">
                        <h3>{results?.turnout}%</h3>
                        <p>TURNOUT</p>
                      </div>
                    </div>
                  </div>
                )
              }

              <div className="section-divider" />
              <h3 className="section-title">Final Results</h3>
              <div className="section-divider" />

              {/* Results grouped by position */}
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

              <div className="final-stats">
                <div className="final-stats-row">
                  <span>Voters Participated</span>
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
                  className="btn btn-outline"
                  onClick={() => navigate('/')}
                >
                  BACK TO HOME
                </button>
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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WinnerAnnouncement;