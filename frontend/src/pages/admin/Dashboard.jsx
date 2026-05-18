import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAdminStats, startSession, endSession, publishResults, resetAllData } from '../../services/adminService';

const Dashboard = () => {
  const navigate = useNavigate();
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
      showMessage(result.message || 'Failed to start session', 'error');
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
      showMessage(result.message || 'Failed to end session', 'error');
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
      showMessage(result.message || 'Failed to publish results', 'error');
    }
  };

  const handleResetData = async () => {
    const confirm = window.confirm('Are you sure you want to reset ALL election data? This cannot be undone!');
    if (!confirm) return;
    const result = await resetAllData();
    if (result.success) {
      setPhase('idle');
      sessionStorage.removeItem('adminPhase');
      sessionStorage.removeItem('electionId');
      showMessage('All data reset successfully!', 'success');
      loadStats();
    } else {
      showMessage(result.message || 'Failed to reset data', 'error');
    }
  };

  const navCards = [
  { label: 'Manage Elections', path: '/admin/elections', enabled: true },

  { label: 'Manage Candidates', path: '/admin/candidates', enabled: true },

  { label: 'Manage Students', path: '/admin/students', enabled: true },

  { label: 'Session Control', path: '/admin/session-control', enabled: true },

  { label: 'System Settings', path: '/admin/settings', enabled: true },

  { label: 'View Results', path: '/results', enabled: phase === 'counting' || phase === 'published' },

  { label: 'View Winner', path: '/winner', enabled: phase === 'published' },

  { label: 'Audit Logs', path: '/admin/audit-logs', enabled: true },
];
  

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />
        <div className="screen-container">
          <div className="card">
            <h2>Admin Dashboard</h2>
            <p className="helper-text">Welcome, {admin?.name}</p>

            <button
  className="btn btn-outline"
  onClick={() => {
    sessionStorage.clear();
    navigate('/');
  }}
>
  LOGOUT
</button>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

            {loading ? (
              <div className="loading-text">Loading stats...</div>
            ) : (
              <>
                {/* Phase Badge */}
                <div className="phase-badge">Phase: {phase}</div>

                {/* Stats */}
                <div className="stats-grid">
                  <div className="stat-box">
                    <h3>{stats?.totalStudents ?? 0}</h3>
                    <p>STUDENTS</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.totalVotes ?? 0}</h3>
                    <p>VOTES</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.totalElections ?? 0}</h3>
                    <p>ELECTIONS</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.activeElections ?? 0}</h3>
                    <p>ACTIVE</p>
                  </div>
                </div>

                {/* Nav Cards */}
                <div className="admin-section">
                  <h3 className="admin-section-title">Quick Navigation</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {navCards.map((card) => (
                      <button
                        key={card.path}
                        className="btn btn-outline"
                        onClick={() => navigate(card.path)}
                        disabled={!card.enabled}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '20px 10px' }}
                      >
                        
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{card.label}</span>
                      </button>
                    ))}
                  </div>
                  {phase === 'idle' && (
                    <p style={{ textAlign: 'center', color: '#777', fontSize: '0.8rem', marginTop: '8px' }}>
                      Results and Winner pages unlock after session ends
                    </p>
                  )}
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