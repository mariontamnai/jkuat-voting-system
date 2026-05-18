import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import {
  getStudents,
  updateStudent,
  deleteStudent
} from '../../services/adminService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const StudentList = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editEmailError, setEditEmailError] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    year: '',
    course: '',
    resetPassword: ''
  });

  const [showResetConfirm, setShowResetConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const studentsPerPage = 10;

  useEffect(() => {
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

    setTimeout(() => {
      setMessage('');
    }, 4000);
  };

  const handleEditStudent = async (studentId) => {
    if (!editForm.name) {
      showMessage('Please enter a name', 'error');
      return;
    }

    if (editForm.email && !emailRegex.test(editForm.email)) {
      showMessage('Please enter valid email', 'error');
      setEditEmailError(true);
      return;
    }

    const updateData = {
      name: editForm.name,
      email: editForm.email,
      year: editForm.year,
      course: editForm.course,
    };

    if (editForm.resetPassword) {
      updateData.password = editForm.resetPassword;
      updateData.isFirstLogin = true;
    }

    const result = await updateStudent(studentId, updateData);

    if (result.success) {
      showMessage('Student updated successfully!', 'success');

      setStudents(prev =>
        prev.map(s =>
          s.id === studentId ? { ...s, ...updateData } : s
        )
      );

      setEditingStudent(null);

    } else {
      showMessage('Failed to update student', 'error');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await deleteStudent(studentId);

    if (result.success) {
      showMessage('Student deleted successfully!', 'success');

      setStudents(prev =>
        prev.filter(s => s.id !== studentId)
      );
      setShowDeleteConfirm(null);
    }
  };

  const handleResetPassword = async (student) => {
    const tempPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();

    const result = await updateStudent(student.id, {
      password: tempPassword,
      isFirstLogin: true,
    });

    if (result.success) {
      showMessage(
        `Password reset. Temp password: ${tempPassword}`,
        'success'
      );

      setShowResetConfirm(null);
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
          <div className="card admin-container">

            <div className="page-top">
              <button
                className="back-btn"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Back to Dashboard
              </button>

              <h2>Registered Students</h2>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Link to="/admin/students/add" className="btn btn-primary">
                + Add New Student
              </Link>
            </div>

            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            <div className="admin-section admin-card">

              <input
                type="text"
                className="form-input"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ marginBottom: '15px' }}
              />

              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  All
                </button>

                <button
                  className={`filter-tab ${filter === 'voted' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('voted');
                    setCurrentPage(1);
                  }}
                >
                  Voted
                </button>

                <button
                  className={`filter-tab ${filter === 'notVoted' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('notVoted');
                    setCurrentPage(1);
                  }}
                >
                  Not Voted
                </button>
              </div>

              {loading ? (
                <div className="loading-text">
                  Loading students...
                </div>
              ) : (
                <>
                  <div className="students-table">
                    <div
                      className="students-table-header"
                      style={{
                        gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr'
                      }}
                    >
                      <span>Name</span>
                      <span>Reg No</span>
                      <span>Year</span>
                      <span>Voted</span>
                      <span>Actions</span>
                    </div>

                    {paginatedStudents.map((student, index) => (
                      <div
                        key={index}
                        className="students-table-row"
                        style={{
                          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr'
                        }}
                      >
                      <span>{student.name}</span>
                        <span>{student.regNo}</span>
                        <span>{student.year}</span>

                        <span>
                          {student.hasVoted ? '✓' : '✗'}
                        </span>

                        <div className="action-btns">
                          <button
                            className="action-btn edit-btn"
                            title="Edit Student"
                            onClick={() => {
                              setEditingStudent(student.id);

                              setEditForm({
                                name: student.name,
                                email: student.email || '',
                                year: student.year || '',
                                course: student.course || '',
                                resetPassword: ''
                              });
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="action-btn reset-btn"
                            title="Reset Password"
                            onClick={() => setShowResetConfirm(student.id)}
                          >
                            Reset
                          </button>

                          <button
                            className="action-btn delete-btn"
                            title="Delete Student"
                            onClick={() => setShowDeleteConfirm(student.id)}
                          >
                            Delete
                          </button>
                        </div>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentList;
