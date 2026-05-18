import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
const faceapi = window.faceapi;
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../services/adminService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Students = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [faceDetectedAdmin, setFaceDetectedAdmin] = useState(false);
  const detectionRef = useRef(null);
  const modelsLoadedRef = useRef(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [emailError, setEmailError] = useState(false);
  const [editEmailError, setEditEmailError] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    year: '',
    email: '',
    regNo: '',
    course: '',
    password: '',
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', year: '', course: '', resetPassword: '' });
  const [showResetConfirm, setShowResetConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const studentsPerPage = 10;

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.3,
  });

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

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoadedRef.current = true;
    setModelsLoaded(true);
  };

  const openCamera = async () => {
    try {
      if (!modelsLoadedRef.current) {
        showMessage('Loading face detection models...', 'success');
        await loadModels();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      setCameraOpen(true);
      setFaceCaptured(false);
      setFaceDescriptor(null);
      setFaceDetectedAdmin(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          videoRef.current.onloadedmetadata = () => {
            startFaceDetection();
          };
        }
      }, 100);
    } catch (err) {
      showMessage('Camera access denied', 'error');
    }
  };

  const startFaceDetection = () => {
    detectionRef.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoadedRef.current) return;
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, detectorOptions)
          .withFaceLandmarks();
        setFaceDetectedAdmin(!!detection);
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 500);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
      detectionRef.current = null;
    }
    setCameraOpen(false);
    setFaceDetectedAdmin(false);
  };

  const captureFace = async () => {
    if (!videoRef.current) {
      showMessage('Camera not ready. Please try again.', 'error');
      return;
    }

    setCapturing(true);
    showMessage('Detecting face...', 'success');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptor = Array.from(detection.descriptor);
        setFaceDescriptor(descriptor);
        setFaceCaptured(true);
        showMessage('Face captured successfully!', 'success');
        closeCamera();
      } else {
        showMessage('No face detected. Make sure your face is clearly visible and try again.', 'error');
      }
    } catch (err) {
      showMessage('Face capture failed. Please try again.', 'error');
      console.error('Capture error:', err);
    }
    setCapturing(false);
  };

  const handleAddStudent = async () => {
    if (
      !studentForm.name ||
      !studentForm.year ||
      !studentForm.email ||
      !studentForm.regNo ||
      !studentForm.course ||
      !studentForm.password
    ) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!emailRegex.test(studentForm.email)) {
      showMessage('Please enter a valid email address (e.g. name@example.com)', 'error');
      setEmailError(true);
      return;
    }

    if (!faceDescriptor) {
      showMessage('Please capture student face first', 'error');
      return;
    }

    const threshold = 0.45;
    for (const existing of students) {
      if (!existing.faceDescriptor) continue;
      const distance = faceapi.euclideanDistance(
        faceDescriptor,
        existing.faceDescriptor
      );
      if (distance < threshold) {
        showMessage(
          `This face is already registered to ${existing.name} (${existing.regNo}). Each student must use their own face.`,
          'error'
        );
        return;
      }
    }

    console.log("REGISTERING WITH PASSWORD:", studentForm.password);

    const result = await addStudent({ ...studentForm, faceDescriptor });
    if (result.success) {
      showMessage('Student added successfully!', 'success');
      setStudents(prev => [...prev, result.student]);
      setStudentForm({ name: '', year: '', email: '', regNo: '', course: '', password: '' });
      setFaceDescriptor(null);
      setFaceCaptured(false);
    } else {
      showMessage(result.message || 'Failed to add student', 'error');
    }
  };

  const handleEditStudent = async (studentId) => {
    if (!editForm.name) {
      showMessage('Please enter a name', 'error');
      return;
    }

    if (editForm.email && !emailRegex.test(editForm.email)) {
      showMessage('Please enter a valid email address (e.g. name@example.com)', 'error');
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
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, ...updateData } : s
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

  const handleResetPassword = async (student) => {
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    const result = await updateStudent(student.id, {
      password: tempPassword,
      isFirstLogin: true,
    });
    if (result.success) {
      showMessage(`Password reset. Temp password: ${tempPassword} — share with ${student.name} securely`, 'success');
      setShowResetConfirm(null);
    } else {
      showMessage('Failed to reset password', 'error');
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
  className={`form-input ${emailError ? 'input-error' : ''}`}
  placeholder="Email Address"
  value={studentForm.email}
  onChange={(e) => {
    setStudentForm({ ...studentForm, email: e.target.value });
    setEmailError(false);
  }}
/>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reg No e.g., SCT111-0111/1900"
                  value={studentForm.regNo}
                  onChange={(e) => setStudentForm({ ...studentForm, regNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Course (e.g. BSc Computer Science)"
                  value={studentForm.course}
                  onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Student Login Password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">STUDENT FACE</label>
                {!cameraOpen && !faceCaptured && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={openCamera}
                  >
                    OPEN CAMERA TO CAPTURE FACE
                  </button>
                )}

                {cameraOpen && (
                  <div className="face-capture-container">
                    <div className={`camera-status ${faceDetectedAdmin ? 'status-success' : 'status-waiting'}`}>
                      {faceDetectedAdmin ? 'Face detected ✓ — Click Capture Face' : 'No face detected — Position your face in the oval'}
                    </div>
                    <div className="video-container">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="webcam"
                      />
                      <div className={`face-overlay ${faceDetectedAdmin ? 'detected' : ''}`} />
                    </div>
                    <div className="button-group" style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={captureFace}
                        disabled={capturing || !faceDetectedAdmin}
                      >
                        {capturing ? 'CAPTURING...' : 'CAPTURE FACE'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={closeCamera}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {faceCaptured && (
                  <div className="alert alert-success">
                    ✅ Face captured successfully! Ready to register.
                    <button
                      type="button"
                      className="back-btn"
                      onClick={openCamera}
                      style={{ marginTop: '5px' }}
                    >
                      Recapture face
                    </button>
                  </div>
                )}
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
                              <div className="students-table-row edit-row" style={{ gridTemplateColumns: '1fr' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Full Name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ padding: '6px', fontSize: '0.85rem' }}
                                  />
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Year"
                                    value={editForm.year}
                                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                    style={{ padding: '6px', fontSize: '0.85rem' }}
                                  />
                                  <input
  type="email"
  className={`form-input ${editEmailError ? 'input-error' : ''}`}
  placeholder="Email"
  value={editForm.email}
  onChange={(e) => {
    setEditForm({ ...editForm, email: e.target.value });
    setEditEmailError(false);
  }}
  style={{ padding: '6px', fontSize: '0.85rem' }}
/>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Course"
                                    value={editForm.course}
                                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                    style={{ padding: '6px', fontSize: '0.85rem' }}
                                  />
                                  <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Reset Password (leave blank to keep current)"
                                    value={editForm.resetPassword}
                                    onChange={(e) => setEditForm({ ...editForm, resetPassword: e.target.value })}
                                    style={{ padding: '6px', fontSize: '0.85rem' }}
                                  />
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>

                                  <button
                                    className="action-btn reset-btn"
                                    title="Reset Password"
                                    onClick={() => setShowResetConfirm(student.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 2v6h-6"/>
                                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                                      <path d="M3 22v-6h6"/>
                                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                                    </svg>
                                  </button>

                                  <button
                                    className="action-btn delete-btn"
                                    title="Delete Student"
                                    onClick={() => setShowDeleteConfirm(student.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                      <path d="M10 11v6"/>
                                      <path d="M14 11v6"/>
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                    </svg>
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

                            {showResetConfirm === student.id && (
                              <div className="delete-confirm">
                                <p>Reset <strong>{student.name}</strong>'s password?</p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                  They will be forced to set a new password on next login.
                                </p>
                                <div className="action-btns">
                                  <button
                                    className="action-btn save-btn"
                                    onClick={() => handleResetPassword(student)}
                                  >
                                    Yes, Reset
                                  </button>
                                  <button
                                    className="action-btn cancel-btn"
                                    onClick={() => setShowResetConfirm(null)}
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