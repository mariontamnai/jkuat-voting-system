import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import {
  getElections,
  getCandidates,
  updateCandidate,
  deleteCandidate
} from '../../services/adminService';

const CandidatesList = () => {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(
    sessionStorage.getItem('electionId') || ''
  );

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [editingCandidate, setEditingCandidate] = useState(null);

  const [editCandidateForm, setEditCandidateForm] = useState({
    name: '',
    position: '',
    party: ''
  });

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(null);

  const admin = JSON.parse(
    sessionStorage.getItem('admin')
  );

  const phase =
    sessionStorage.getItem('adminPhase') || 'idle';

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

      const savedId =
        sessionStorage.getItem('electionId');

      if (savedId) {
        setSelectedElection(savedId);
      }
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setMessage('');
    }, 5000);
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
    const result = await updateCandidate(
      selectedElection,
      candidateId,
      editCandidateForm
    );

    if (result.success) {
      showMessage(
        'Candidate updated successfully!',
        'success'
      );

      setEditingCandidate(null);

      loadCandidates(selectedElection);

    } else {
      showMessage(
        result.message ||
          'Failed to update candidate',
        'error'
      );
    }
  };

  const handleDeleteCandidate = async (
    candidateId
  ) => {
    const result = await deleteCandidate(
      selectedElection,
      candidateId
    );

    if (result.success) {
      showMessage(
        'Candidate deleted successfully!',
        'success'
      );

      setShowDeleteConfirm(null);

      loadCandidates(selectedElection);

    } else {
      showMessage(
        result.message ||
          'Failed to delete candidate',
        'error'
      );
    }
  };

  const groupedCandidates = candidates.reduce(
    (acc, candidate) => {
      const pos =
        candidate.position || 'Unknown';

      if (!acc[pos]) {
        acc[pos] = [];
      }

      acc[pos].push(candidate);

      return acc;
    },
    {}
  );

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            {/* Back Button */}
            <button
              className="back-btn"
              onClick={() =>
                navigate('/admin/candidates')
              }
            >
              ← Back to Candidates
            </button>

            <h2>Candidates List</h2>

            {message && (
              <div
                className={`alert alert-${messageType}`}
              >
                {message}
              </div>
            )}

            

            {/* Candidates List */}
            {selectedElection && (
              <div className="admin-section">

                <h3 className="admin-section-title">
                  All Candidates{' '}
                  {candidates.length > 0 &&
                    `(${candidates.length})`}
                </h3>

                {loading ? (

                  <div className="loading-text">
                    Loading candidates...
                  </div>

                ) : candidates.length === 0 ? (

                  <p
                    style={{
                      textAlign: 'center',
                      color: '#777',
                      padding: '20px'
                    }}
                  >
                    No candidates added yet
                  </p>

                ) : (

                  Object.entries(
                    groupedCandidates
                  ).map(
                    ([
                      position,
                      positionCandidates
                    ]) => (
                      <div
                        key={position}
                        style={{
                          marginBottom: '20px'
                        }}
                      >
                        <div
                          style={{
                            background: '#2e7d32',
                            color: 'white',
                            padding:
                              '8px 15px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent:
                              'space-between'
                          }}
                        >
                          <span>{position}</span>

                          <span
                            style={{
                              fontSize:
                                '0.75rem'
                            }}
                          >
                            {
                              positionCandidates.length
                            }{' '}
                            candidates
                          </span>
                        </div>

                        {positionCandidates.map(
                          (c) => (
                            <div
                              key={c.id}
                            >
                              {/* KEEP YOUR EXISTING EDIT/DELETE CARD UI HERE */}
                            </div>
                          )
                        )}
                      </div>
                    )
                  )

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