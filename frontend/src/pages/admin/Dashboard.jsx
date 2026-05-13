import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAdminStats, getElections, startSession, endSession, publishResults } from '../../services/adminService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(sessionStorage.getItem('electionId') || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [phase, setPhase] = useState(sessionStorage.getItem('adminPhase') || 'idle');

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadStats();
    loadElections();
  }, []);

  useEffect(() => {
    let interval;
    if (phase === 'voting') {
      interval = setInterval(() => {
        loadStats();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const loadElections = async () => {
  try {
    const result = await getElections();
    if (result.success) {
      setElections(result.elections);
    }
  } catch (err) {
    console.error('Elections error:', err);
  }
};

  const loadStats = async () => {
  try {
    const result = await getAdminStats(phase);
    if (result.success) {
      setStats(result.stats);
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
  setLoading(false);
};

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMessage(''), 5000);
  };

  const handleStartSession = async () => {
    const result = await startSession();
    if (result.success) {
      setPhase('voting');
      sessionStorage.setItem('adminPhase', 'voting');
      sessionStorage.setItem('sessionStatus', 'active');
      showMessage('Session started successfully!', 'success');
      loadStats();
    } else {
      showMessage('Failed to start session', 'error');
    }
  };

  const handleEndSession = async () => {
    const result = await endSession();
    if (result.success) {
      setPhase('counting');
      sessionStorage.setItem('adminPhase', 'counting');
      sessionStorage.setItem('sessionStatus', 'ended');
      showMessage('Session ended successfully!', 'success');
      loadStats();
    } else {
      showMessage('Failed to end session', 'error');
    }
  };

  const handlePublishResults = async () => {
    const result = await publishResults();
    if (result.success) {
      setPhase('published');
      sessionStorage.setItem('adminPhase', 'published');
      sessionStorage.setItem('resultsPublished', 'true');
      showMessage('Results published successfully!', 'success');
      setTimeout(() => navigate('/winner'), 1500);
    } else {
      showMessage('Failed to publish results', 'error');
    }
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>Admin Dashboard</h2>
            <p className="helper-text">Welcome, {admin?.name}</p>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

            {loading ? (
              <div className="loading-text">Loading stats...</div>
            ) : (
              <>
                <div className="phase-badge">Phase: {stats?.phase}</div>

                {phase === 'published' && (
                  <div className="alert alert-success">
                    ✅ Election is officially over. Results have been published.
                  </div>
                )}

                {phase === 'published' && (
                  <button
                    className="btn btn-primary"
                    style={{ marginBottom: '20px' }}
                    onClick={() => navigate('/winner')}
                  >
                    VIEW WINNER 🏆
                  </button>
                )}

                <div className="stats-grid">
                  <div className="stat-box">
                    <h3>{stats?.totalStudents}</h3>
                    <p>STUDENTS</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.totalVotes}</h3>
                    <p>VOTES</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.totalElections}</h3>
                    <p>ELECTIONS</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.activeElections}</h3>
                    <p>ACTIVE</p>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Select Election</h3>
                  <select
                    className="form-input"
                    value={selectedElection}
                    onChange={(e) => {
                      setSelectedElection(e.target.value);
                      sessionStorage.setItem('electionId', e.target.value);
                    }}
                    disabled={phase !== 'idle'}
                  >
                    <option value="">-- Select an election --</option>
                    {elections.map(election => (
                      <option key={election.id} value={election.id}>
                        {election.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Voting</h3>
                  <div className="button-group">
                    <button
                      className="btn btn-primary"
                      onClick={handleStartSession}
                      disabled={phase !== 'idle' || !selectedElection}
                    >
                      START SESSION
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleEndSession}
                      disabled={phase !== 'voting'}
                    >
                      END SESSION
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Counting</h3>
                  <div className="button-group">
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate('/results')}
                      disabled={phase !== 'counting'}
                    >
                      VIEW RESULTS
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Finalization</h3>
                  <div className="button-group">
                    <button
                      className="btn btn-primary"
                      onClick={handlePublishResults}
                      disabled={phase !== 'counting'}
                    >
                      PUBLISH RESULTS
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Students</h3>
                  <div className="button-group">
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate('/admin/students')}
                    >
                      MANAGE STUDENTS
                    </button>
                  </div>
                </div>

                <div className="admin-section">
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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;