import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getElections } from '../../services/adminService';

const Candidates = () => {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);

  const [selectedElection, setSelectedElection] =
    useState(
      sessionStorage.getItem('electionId') || ''
    );

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
                navigate('/admin/dashboard')
              }
            >
              ← Back to Dashboard
            </button>

            <h2>Manage Candidates</h2>

            {/* Select Election */}
            <div className="admin-section">

              <h3 className="admin-section-title">
                Select Election
              </h3>

              <select
                className="form-input"
                value={selectedElection}
                onChange={(e) => {
                  setSelectedElection(
                    e.target.value
                  );

                  sessionStorage.setItem(
                    'electionId',
                    e.target.value
                  );
                }}
              >
                <option value="">
                  -- Select an election --
                </option>

                {elections.map((election) => (
                  <option
                    key={election.id}
                    value={election.id}
                  >
                    {election.title} (
                    {election.status})
                  </option>
                ))}

              </select>

            </div>

            {/* Action Buttons */}
            {selectedElection && (

              <div className="admin-section">

                <div className="candidate-actions">

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(
                        '/admin/candidates/create'
                      )
                    }
                    disabled={phase !== 'idle'}
                  >
                    + ADD CANDIDATE
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      navigate(
                        '/admin/candidates/list'
                      )
                    }
                  >
                    VIEW ALL CANDIDATES
                  </button>

                </div>

                {phase !== 'idle' && (
                  <p className="warning-text">
                    Cannot modify candidates
                    while a session is active
                  </p>
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

export default Candidates;