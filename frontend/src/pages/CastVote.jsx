import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CandidateCard from '../components/CandidateCard';
import { getCandidates, castVote } from '../services/voteService';

const CastVote = () => {
  const navigate = useNavigate();
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votedPositions, setVotedPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!user || !token) {
      navigate('/student-login');
      return;
    }
    if (user.hasVoted) {
      navigate('/vote-submitted');
      return;
    }
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const result = await getCandidates();
    if (result.success) {
      // group candidates by position
      const grouped = {};
      result.candidates.forEach(candidate => {
        const position = candidate.faculty; // faculty holds position
        if (!grouped[position]) {
          grouped[position] = [];
        }
        grouped[position].push(candidate);
      });
      setCandidatesByPosition(grouped);
      setPositions(Object.keys(grouped));
    }
    setLoading(false);
  };

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = candidatesByPosition[currentPosition] || [];

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await castVote(selectedCandidate.id);

    if (result.success) {
      setVotedPositions(result.votedPositions);
      
      if (result.allPositionsVoted) {
        // all positions done — go to submitted page
        const updatedUser = { ...user, hasVoted: true };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('votedFor', JSON.stringify(selectedCandidate));
        navigate('/vote-submitted');
      } else {
        // move to next position
        setSelectedCandidate(null);
        setCurrentPositionIndex(prev => prev + 1);
      }
    } else {
      setError(result.message || 'Failed to cast vote. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>Cast Your Vote</h2>
            <p className="description">
              Select your preferred candidate below.{' '}
              <strong>Your vote is end-to-end encrypted</strong>{' '}
              and cannot be modified once submitted.
            </p>

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
                <span className="vote-status not-voted">NOT VOTED</span>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Progress indicator */}
            {positions.length > 0 && (
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Position {currentPositionIndex + 1} of {positions.length}
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                  {positions.map((pos, i) => (
                    <div
                      key={pos}
                      style={{
                        width: '30px',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: i < currentPositionIndex 
                          ? '#2d6a4f' 
                          : i === currentPositionIndex 
                          ? '#52b788' 
                          : '#ccc'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <h3 className="section-title">
              {currentPosition || 'Loading...'}
            </h3>
            <div className="section-divider" />

            {loading ? (
              <div className="loading-text">Loading candidates...</div>
            ) : (
              <div className="candidates-grid">
                {currentCandidates.map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={selectedCandidate?.id === candidate.id}
                    onSelect={setSelectedCandidate}
                  />
                ))}
              </div>
            )}

            {selectedCandidate && (
              <div className="alert alert-success">
                You selected: <strong>{selectedCandidate.name}</strong>
              </div>
            )}

            <div className="button-group" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || submitting}
              >
                {submitting 
                  ? 'SUBMITTING...' 
                  : currentPositionIndex === positions.length - 1 
                  ? 'SUBMIT FINAL VOTE' 
                  : 'SUBMIT & NEXT POSITION'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CastVote;