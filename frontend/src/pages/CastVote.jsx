import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CandidateCard from '../components/CandidateCard';
import { getCandidates, castVote } from '../services/voteService';

const CastVote = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
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
      setCandidates(result.candidates);
    }
    setLoading(false);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await castVote(selectedCandidate.id, user.id, token);

    if (result.success) {
      const updatedUser = { ...user, hasVoted: true };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('votedFor', JSON.stringify(selectedCandidate));
      navigate('/vote-submitted');
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
                <span className={`vote-status ${user?.hasVoted ? 'voted' : 'not-voted'}`}>
                  {user?.hasVoted ? 'VOTED' : 'NOT VOTED'}
                </span>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <h3 className="section-title">Select Your Candidate</h3>
            <div className="section-divider" />

            {loading ? (
  <div className="loading-text">Loading candidates...</div>
) : (
  <>
    {user?.hasVoted && (
      <div className="alert alert-error">
        You have already voted. Candidates are locked.
      </div>
    )}
    <div className="candidates-grid">
      {candidates.map(candidate => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          selected={selectedCandidate?.id === candidate.id}
          onSelect={user?.hasVoted ? () => {} : setSelectedCandidate}
          disabled={user?.hasVoted}
        />
      ))}
    </div>
  </>
)}

{selectedCandidate && !user?.hasVoted && (
  <div className="alert alert-success">
    You selected: <strong>{selectedCandidate.name}</strong>
  </div>
)}

<div className="button-group" style={{ marginTop: '20px' }}>
  <button
    className="btn btn-primary"
    onClick={handleSubmitVote}
    disabled={!selectedCandidate || submitting || user?.hasVoted}
  >
    {user?.hasVoted ? 'ALREADY VOTED' : submitting ? 'SUBMITTING...' : 'SUBMIT VOTE'}
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