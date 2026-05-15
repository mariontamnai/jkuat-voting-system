import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getElections, getCandidates, updateCandidate, deleteCandidate } from '../../services/adminService';

const CandidatesList = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(sessionStorage.getItem('electionId') || '');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editCandidateForm, setEditCandidateForm] = useState({ name: '', position: '', party: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const admin = JSON.parse(sessionStorage.getItem('admin'));
  const phase = sessionStorage.getItem('adminPhase') || 'idle';

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      loadCandidates(selectedElection);
    }
  }, [selectedElection]);

  const loadElections = async () => {
    const result = await getElections();
    if (result.success) {
      setElections(result.elections);
      const savedId = sessionStorage.getItem('electionId');
      if (savedId) setSelectedElection(savedId);
    }
  };

  const loadCandidates = async (electionId) => {
    setLoading(true);
    const result = await getCandidates(electionId);
    if (result.success) {
      setCandidates(result.candidates);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMessage(''), 5000);
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate.id);
    setEditCandidateForm({
      name: candidate.name,
      position: candidate.position,
      party: candidate.party || ''
    });
  };

  const handleSaveCandidate = async (candidateId) => {
    const result = await updateCandidate(selectedElection, candidateId, editCandidateForm);
    if (result.success) {
      showMessage('Candidate updated successfully!', 'success');
      setEditingCandidate(null);
      loadCandidates(selectedElection);
    } else {
      showMessage(result.message || 'Failed to update candidate', 'error');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    const result = await deleteCandidate(selectedElection, candidateId);
    if (result.success) {
      showMessage('Candidate deleted successfully!', 'success');
      setShowDeleteConfirm(null);
      loadCandidates(selectedElection);
    } else {
      showMessage(result.message || 'Failed to delete candidate', 'error');
    }
  };

  const groupedCandidates = candidates.reduce((acc, candidate) => {
    const pos = candidate.position || 'Unknown';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(candidate);
    return acc;
  }, {});

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />
        <div className="screen-container">
          <div className="card">

            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
              ← Back to Dashboard
            </button>

            <h2>Candidates List</h2>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

            {/* Select Election */}
            <div className="admin-section">
              <h3 className="admin-section-title">Select Election</h3>
              <select
                className="form-input"
                value={selectedElection}
                onChange={(e) => {
                  setSelectedElection(e.target.value);
                  sessionStorage.setItem('electionId', e.target.value);
                }}
              >
                <option value="">-- Select an election --</option>
                {elections.map(election => (
                  <option key={election.id} value={election.id}>
                    {election.title} ({election.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedElection && (
              <div className="admin-section">
                <h3 className="admin-section-title">
                  All Candidates {candidates.length > 0 && `(${candidates.length})`}
                </h3>

                {loading ? (
                  <div className="loading-text">Loading candidates...</div>
                ) : candidates.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>
                    No candidates added yet —{' '}
                    <span
                      style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: '700' }}
                      onClick={() => navigate('/admin/candidates')}
                    >
                      Add candidates here
                    </span>
                  </p>
                ) : (
                  Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
                    <div key={position} style={{ marginBottom: '20px' }}>
                      <div style={{
                        background: '#2e7d32',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{position}</span>
                        <span style={{ fontSize: '0.75rem', opacity: '0.85' }}>
                          {positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {positionCandidates.map((c) => (
                        <div key={c.id}>
                          {editingCandidate === c.id ? (
                            <div style={{
                              padding: '12px',
                              border: '2px solid #2e7d32',
                              borderRadius: '10px',
                              marginBottom: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <input
                                className="form-input"
                                value={editCandidateForm.name}
                                onChange={(e) => setEditCandidateForm({ ...editCandidateForm, name: e.target.value })}
                                placeholder="Name"
                              />
                              <input
                                className="form-input"
                                value={editCandidateForm.position}
                                onChange={(e) => setEditCandidateForm({ ...editCandidateForm, position: e.target.value })}
                                placeholder="Position"
                              />
                              <input
                                className="form-input"
                                value={editCandidateForm.party}
                                onChange={(e) => setEditCandidateForm({ ...editCandidateForm, party: e.target.value })}
                                placeholder="Party (optional)"
                              />
                              <div className="action-btns">
                                <button className="action-btn save-btn" onClick={() => handleSaveCandidate(c.id)}>
                                  Save
                                </button>
                                <button className="action-btn cancel-btn" onClick={() => setEditingCandidate(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : showDeleteConfirm === c.id ? (
                            <div className="delete-confirm" style={{ marginBottom: '8px' }}>
                              <span>Delete <strong>{c.name}</strong>?</span>
                              <div className="action-btns">
                                <button className="action-btn delete-btn" onClick={() => handleDeleteCandidate(c.id)}>
                                  Yes, Delete
                                </button>
                                <button className="action-btn cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              padding: '12px 15px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '10px',
                              marginBottom: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</p>
                                {c.party && (
                                  <p style={{ fontSize: '0.78rem', color: '#777', marginTop: '2px' }}>
                                    {c.party}
                                  </p>
                                )}
                              </div>
                              <div className="action-btns">
                                <button
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditCandidate(c)}
                                  disabled={phase !== 'idle'}
                                >
                                  Edit
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => setShowDeleteConfirm(c.id)}
                                  disabled={phase !== 'idle'}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CandidatesList;