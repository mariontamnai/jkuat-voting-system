import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getElections, createElection } from '../../services/adminService';

const Elections = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const admin = JSON.parse(sessionStorage.getItem('admin'));
  const phase = sessionStorage.getItem('adminPhase') || 'idle';

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);
    const result = await getElections();
    if (result.success) {
      setElections(result.elections);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCreateElection = async () => {
    const result = await createElection(newElection);
    if (result.success) {
      showMessage('Election created successfully!', 'success');
      setShowCreateForm(false);
      setNewElection({ title: '', description: '', startDate: '', endDate: '' });
      loadElections();
    } else {
      showMessage(result.message || 'Failed to create election', 'error');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active') return '#2e7d32';
    if (status === 'completed') return '#1565c0';
    if (status === 'draft') return '#e65100';
    return '#777';
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />
        <div className="screen-container">
          <div className="card">

            {/* Back Button */}
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
              ← Back to Dashboard
            </button>

            <h2>Manage Elections</h2>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

            {/* Create Election Button */}
            <div className="admin-section">
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={phase !== 'idle'}
              >
                {showCreateForm ? 'CANCEL' : '+ CREATE NEW ELECTION'}
              </button>

              {phase !== 'idle' && (
                <p style={{ color: '#e53935', fontSize: '0.85rem', marginTop: '8px', textAlign: 'center' }}>
                  Cannot create elections while a session is active
                </p>
              )}

              {showCreateForm && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    className="form-input"
                    placeholder="Election Title"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                  />
                  <input
                    className="form-input"
                    placeholder="Description (optional)"
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  />
                  <label className="form-label">START DATE</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                  />
                  <label className="form-label">END DATE</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateElection}
                    disabled={!newElection.title || !newElection.startDate || !newElection.endDate}
                  >
                    SAVE ELECTION
                  </button>
                </div>
              )}
            </div>

            {/* Elections List */}
            <div className="admin-section">
              <h3 className="admin-section-title">All Elections</h3>

              {loading ? (
                <div className="loading-text">Loading elections...</div>
              ) : elections.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>
                  No elections created yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {elections.map((election) => (
                    <div
                      key={election.id}
                      style={{
                        border: '2px solid #c8e6c9',
                        borderRadius: '12px',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{election.title}</p>
                        <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '4px' }}>
                          ID: {election.id}
                        </p>
                      </div>
                      <span style={{
                        background: getStatusColor(election.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {election.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Elections;