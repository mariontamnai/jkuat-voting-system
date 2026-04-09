import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAdminStats, addStudent, getStudents, startSession, endSession, publishResults } from '../../services/adminService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [phase, setPhase] = useState(sessionStorage.getItem('adminPhase') || 'idle');
  const [studentForm, setStudentForm] = useState({
    name: '',
    year: '',
    email: '',
    regNo: '',
  });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadStats();
    loadStudents();
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
    const result = await getAdminStats(phase);
    if (result.success) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  const loadStudents = async () => {
    const result = await getStudents();
    if (result.success) {
      setStudents(result.students);
    }
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

  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.year || !studentForm.email || !studentForm.regNo) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    const result = await addStudent(studentForm);
    if (result.success) {
      showMessage('Student added successfully!', 'success');
      setStudents(prev => [...prev, result.student]);
      setStudentForm({ name: '', year: '', email: '', regNo: '' });
    } else {
      showMessage('Failed to add student', 'error');
    }
  };

  const filteredStudents = students
    .filter(s => {
      if (filter === 'voted') return s.hasVoted === true;
      if (filter === 'notVoted') return s.hasVoted === false;
      return true;
    })
    .filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

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
                    <button
                      className="btn btn-primary"
                      onClick={handleStartSession}
                      disabled={phase !== 'idle'}
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

                  {students.length > 0 && (
                    <div className="students-table-container">
                      <h4 className="students-table-title">
                        Registered Students ({students.length})
                      </h4>

                      <input
                        type="text"
                        className="form-input"
                        placeholder=" Search by name or reg number..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{ marginBottom: '10px' }}
                      />

                      <div className="filter-tabs">
                        <button
                          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                          onClick={() => { setFilter('all'); setCurrentPage(1); }}
                        >
                          All ({students.length})
                        </button>
                        <button
                          className={`filter-tab ${filter === 'voted' ? 'active' : ''}`}
                          onClick={() => { setFilter('voted'); setCurrentPage(1); }}
                        >
                          Voted ✓ ({students.filter(s => s.hasVoted).length})
                        </button>
                        <button
                          className={`filter-tab ${filter === 'notVoted' ? 'active' : ''}`}
                          onClick={() => { setFilter('notVoted'); setCurrentPage(1); }}
                        >
                          Not Voted ✗ ({students.filter(s => !s.hasVoted).length})
                        </button>
                      </div>

                      {filteredStudents.length === 0 ? (
                        <div className="loading-text">No students found</div>
                      ) : (
                        <>
                          <div className="students-table">
                            <div className="students-table-header">
                              <span>Name</span>
                              <span>Reg No</span>
                              <span>Year</span>
                              <span>Voted</span>
                            </div>
                            {paginatedStudents.map((student, index) => (
                              <div key={index} className="students-table-row">
                                <span>{student.name}</span>
                                <span>{student.regNo}</span>
                                <span>{student.year}</span>
                                <span className={student.hasVoted ? 'voted-yes' : 'voted-no'}>
                                  {student.hasVoted ? '✓' : '✗'}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pagination">
                            <button
                              className="pagination-btn"
                              onClick={() => setCurrentPage(prev => prev - 1)}
                              disabled={currentPage === 1}
                            >
                              ← Prev
                            </button>
                            <span className="pagination-info">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              className="pagination-btn"
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next →
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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