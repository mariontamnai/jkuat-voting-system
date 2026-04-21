import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../services/adminService';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentForm, setStudentForm] = useState({
    name: '',
    year: '',
    email: '',
    regNo: '',
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const studentsPerPage = 10;

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const result = await getStudents();
    if (result.success) {
      setStudents(result.students);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMessage(''), 5000);
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

  const handleEditStudent = async (studentId) => {
    if (!editForm.name) {
      showMessage('Please enter a name', 'error');
      return;
    }
    const result = await updateStudent(studentId, { name: editForm.name });
    if (result.success) {
      showMessage('Student updated successfully!', 'success');
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, name: editForm.name } : s
      ));
      setEditingStudent(null);
    } else {
      showMessage('Failed to update student', 'error');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await deleteStudent(studentId);
    if (result.success) {
      showMessage('Student deleted successfully!', 'success');
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setShowDeleteConfirm(null);
    } else {
      showMessage('Failed to delete student', 'error');
    }
  };

  const filteredStudents = students
    .filter(s => {
      if (filter === 'voted') return s.hasVoted === true;
      if (filter === 'notVoted') return s.hasVoted === false;
      return true;
    })
    .filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="page-top">
              <button
                className="back-btn"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Back to Dashboard
              </button>
              <h2>Manage Students</h2>
            </div>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

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
              <h3 className="admin-section-title">
                Registered Students ({students.length})
              </h3>

              {loading ? (
                <div className="loading-text">Loading students...</div>
              ) : (
                <>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search by name or reg number..."
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
                        <div className="students-table-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                          <span>Name</span>
                          <span>Reg No</span>
                          <span>Year</span>
                          <span>Voted</span>
                          <span>Actions</span>
                        </div>
                        {paginatedStudents.map((student, index) => (
                          <div key={index}>
                            {editingStudent === student.id ? (
                              <div className="students-table-row edit-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ name: e.target.value })}
                                  style={{ padding: '6px', fontSize: '0.85rem' }}
                                />
                                <span>{student.regNo}</span>
                                <span>{student.year}</span>
                                <span className={student.hasVoted ? 'voted-yes' : 'voted-no'}>
                                  {student.hasVoted ? '✓' : '✗'}
                                </span>
                                <div className="action-btns">
                                  <button
                                    className="action-btn save-btn"
                                    onClick={() => handleEditStudent(student.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="action-btn cancel-btn"
                                    onClick={() => setEditingStudent(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="students-table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                                <span>{student.name}</span>
                                <span>{student.regNo}</span>
                                <span>{student.year}</span>
                                <span className={student.hasVoted ? 'voted-yes' : 'voted-no'}>
                                  {student.hasVoted ? '✓' : '✗'}
                                </span>
                                <div className="action-btns">
                                  <button
                                    className="action-btn edit-btn"
                                    onClick={() => {
                                      setEditingStudent(student.id);
                                      setEditForm({ name: student.name });
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="action-btn delete-btn"
                                    onClick={() => setShowDeleteConfirm(student.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            )}

                            {showDeleteConfirm === student.id && (
                              <div className="delete-confirm">
                                <p>Delete <strong>{student.name}</strong>?</p>
                                <div className="action-btns">
                                  <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteStudent(student.id)}
                                  >
                                    Yes, Delete
                                  </button>
                                  <button
                                    className="action-btn cancel-btn"
                                    onClick={() => setShowDeleteConfirm(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Students;