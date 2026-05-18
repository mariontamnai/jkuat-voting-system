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

  const [selectedElection, setSelectedElection] =
    useState(
      sessionStorage.getItem('electionId') || ''
    );

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState('');

  const [editingCandidate, setEditingCandidate] =
    useState(null);

  const [editCandidateForm, setEditCandidateForm] =
    useState({
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
    sessionStorage.getItem('adminPhase') ||
    'idle';

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

    const result = await getCandidates(
      electionId
    );

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

  const handleSaveCandidate = async (
    candidateId
  ) => {
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

                  <p className="empty-text">
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
                        className="position-group"
                      >

                        {/* Position Header */}
                        <div className="position-header">

                          <span>
                            {position}
                          </span>

                          <span className="position-count">
                            {
                              positionCandidates.length
                            }{' '}
                            candidate
                            {positionCandidates.length !==
                            1
                              ? 's'
                              : ''}
                          </span>

                        </div>

                        {/* Candidate Cards */}
                        {positionCandidates.map(
                          (c) => (
                            <div key={c.id}>

                              {editingCandidate ===
                              c.id ? (

                                <div className="candidate-edit-card">

                                  <input
                                    className="form-input"
                                    value={
                                      editCandidateForm.name
                                    }
                                    onChange={(e) =>
                                      setEditCandidateForm(
                                        {
                                          ...editCandidateForm,
                                          name:
                                            e
                                              .target
                                              .value
                                        }
                                      )
                                    }
                                    placeholder="Name"
                                  />

                                  <input
                                    className="form-input"
                                    value={
                                      editCandidateForm.position
                                    }
                                    onChange={(e) =>
                                      setEditCandidateForm(
                                        {
                                          ...editCandidateForm,
                                          position:
                                            e
                                              .target
                                              .value
                                        }
                                      )
                                    }
                                    placeholder="Position"
                                  />

                                  <input
                                    className="form-input"
                                    value={
                                      editCandidateForm.party
                                    }
                                    onChange={(e) =>
                                      setEditCandidateForm(
                                        {
                                          ...editCandidateForm,
                                          party:
                                            e
                                              .target
                                              .value
                                        }
                                      )
                                    }
                                    placeholder="Party"
                                  />

                                  <div className="action-btns">

                                    <button
                                      className="action-btn save-btn"
                                      onClick={() =>
                                        handleSaveCandidate(
                                          c.id
                                        )
                                      }
                                    >
                                      Save
                                    </button>

                                    <button
                                      className="action-btn cancel-btn"
                                      onClick={() =>
                                        setEditingCandidate(
                                          null
                                        )
                                      }
                                    >
                                      Cancel
                                    </button>

                                  </div>

                                </div>

                              ) : showDeleteConfirm ===
                                c.id ? (

                                <div className="delete-confirm">

                                  <span>
                                    Delete{' '}
                                    <strong>
                                      {c.name}
                                    </strong>
                                    ?
                                  </span>

                                  <div className="action-btns">

                                    <button
                                      className="action-btn delete-btn"
                                      onClick={() =>
                                        handleDeleteCandidate(
                                          c.id
                                        )
                                      }
                                    >
                                      Yes, Delete
                                    </button>

                                    <button
                                      className="action-btn cancel-btn"
                                      onClick={() =>
                                        setShowDeleteConfirm(
                                          null
                                        )
                                      }
                                    >
                                      Cancel
                                    </button>

                                  </div>

                                </div>

                              ) : (

                                <div className="candidate-card">

                                  <div className="candidate-info">

                                    <p className="candidate-name">
                                      {c.name}
                                    </p>

                                    

                                    {c.party && (
                                      <p className="candidate-party">
                                        {c.party}
                                      </p>
                                    )}

                                  </div>

                                  <div className="action-btns">

                                    <button
                                      className="action-btn edit-btn"
                                      onClick={() =>
                                        handleEditCandidate(
                                          c
                                        )
                                      }
                                      disabled={
                                        phase !==
                                        'idle'
                                      }
                                    >
                                      Edit
                                    </button>

                                    <button
                                      className="action-btn delete-btn"
                                      onClick={() =>
                                        setShowDeleteConfirm(
                                          c.id
                                        )
                                      }
                                      disabled={
                                        phase !==
                                        'idle'
                                      }
                                    >
                                      Delete
                                    </button>

                                  </div>

                                </div>

                              )}

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