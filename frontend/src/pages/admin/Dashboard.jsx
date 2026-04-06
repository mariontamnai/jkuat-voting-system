import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAdminStats, addStudent, startSession, endSession, publishResults } from '../../services/adminService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [phase, setPhase] = useState('idle');
  const [studentForm, setStudentForm] = useState({
    name: '',
    year: '',
    email: '',
    regNo: '',
  });

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await getAdminStats();
    if (result.success) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStartSession = async () => {
    const result = await startSession();
    if (result.success) {
      setPhase('voting');
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
      showMessage('Session ended successfully!', 'success');
      loadStats();
    } else {
      showMessage('Failed to end session', 'error');
    }
  };

  const handlePublishResults = async () => {
    const result = await publishResults();
    if (result.success) {
      setPhase('idle');
      showMessage('Results published successfully!', 'success');
    } else {
      showMessage('Failed to publish results', 'error');
    }
  };

  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.year || !studentForm.email || !studentForm.regNo) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const result = await addStudent(studentForm);
    if (result.success) {
      showMessage('Student added successfully!', 'success');
      setStudentForm({ name: '', year: '', email: '', regNo: '' });
    } else {
      showMessage('Failed to add student', 'error');
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

                <div className="stats-grid">
                  <div className="stat-box">
                    <h3>{stats?.totalVotes}</h3>
                    <p>VOTES</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.turnout}%</h3>
                    <p>TURNOUT</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.sessions}</h3>
                    <p>SESSIONS</p>
                  </div>
                  <div className="stat-box">
                    <h3>{stats?.verified}</h3>
                    <p>VERIFIED</p>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Voting</h3>
                  <div className="button-group">
                    <button className="btn btn-primary" onClick={handleStartSession} disabled={phase !== 'idle'}>
                      START SESSION
                    </button>
                    <button className="btn btn-outline" onClick={handleEndSession} disabled={phase !== 'voting'}>
                      END SESSION
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Counting</h3>
                  <div className="button-group">
                    <button className="btn btn-outline" onClick={() => navigate('/results')} disabled={phase !== 'counting'}>
                      VIEW RESULTS
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Finalization</h3>
                  <div className="button-group">
                    <button className="btn btn-primary" onClick={handlePublishResults} disabled={phase !== 'counting'}>
                      PUBLISH RESULTS
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Add New Student</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Full Name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Year (e.g. 3)"
                      value={studentForm.year}
                      onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Email Address"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Registration Number e.g., SCT111-0111/1900"
                      value={studentForm.regNo}
                      onChange={(e) => setStudentForm({ ...studentForm, regNo: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleAddStudent}>
                    ADD STUDENT
                  </button>
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