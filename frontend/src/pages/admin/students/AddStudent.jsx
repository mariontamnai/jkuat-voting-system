import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getStudents, addStudent } from '../../../services/adminService';

const faceapi = window.faceapi;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddStudent = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [faceDetectedAdmin, setFaceDetectedAdmin] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [adding, setAdding] = useState(false); // NEW: loading state for add button
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [addProgress, setAddProgress] = useState('');


  const [studentForm, setStudentForm] = useState({
    name: '',
    year: '',
    email: '',
    regNo: '',
    course: '',
    password: '',
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);
  const modelsLoadedRef = useRef(false);

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
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setMessage('');
    }, 4000);
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
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
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
        console.error(err);
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
      showMessage('Camera not ready', 'error');
      return;
    }

    setCapturing(true);

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

        showMessage('Face captured successfully', 'success');

        closeCamera();
      } else {
        showMessage('No face detected', 'error');
      }

    } catch (err) {
      showMessage('Face capture failed', 'error');
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
    showMessage('Please enter a valid email address', 'error');
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
    const distance = faceapi.euclideanDistance(faceDescriptor, existing.faceDescriptor);
    if (distance < threshold) {
      showMessage(`This face already belongs to ${existing.name}`, 'error');
      return;
    }
  }

  setAdding(true);  

  try {
    const result = await addStudent({
      ...studentForm,
      faceDescriptor
    });

    if (result && result.success) {
      setStudentForm({
        name: '',
        year: '',
        email: '',
        regNo: '',
        course: '',
        password: '',
      });

      setFaceDescriptor(null);
      setFaceCaptured(false);
      setEmailError(false);

      showMessage('Student added successfully!', 'success');
      await loadStudents();
      
    } else {
      showMessage(result?.message || 'Failed to add student', 'error');
    }
  } catch (error) {
    console.error('Add student error:', error);
    showMessage('An error occurred while adding student', 'error');
  } finally {
    setAdding(false);  
  }
};
  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card admin-container">

            {/* Header with Back button and title only */}
            <div className="page-top">
              <button
                className="back-btn"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Back to Dashboard
              </button>

              <h2>Add Student</h2>
            </div>

            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            <div className="admin-section admin-card">

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Full Name"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      name: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Year"
                  value={studentForm.year}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      year: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  className={`form-input ${emailError ? 'input-error' : ''}`}
                  placeholder="Email Address"
                  value={studentForm.email}
                  onChange={(e) => {
                    const val = e.target.value;

                    setStudentForm({
                      ...studentForm,
                      email: val
                    });

                    setEmailError(
                      val.length > 0 && !emailRegex.test(val)
                    );
                  }}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Registration Number"
                  value={studentForm.regNo}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      regNo: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Course"
                  value={studentForm.course}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      course: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password"
                    value={studentForm.password}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        password: e.target.value
                      })
                    }
                  />

                  <button
                    type="button"
                    className="eye-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="capture-section">
                <label className="form-label">Student Face</label>

                {!cameraOpen && !faceCaptured && (
                  <button
                    type="button"
                    className="btn btn-outline open-camera-btn"
                    onClick={openCamera}
                  >
                    OPEN CAMERA
                  </button>
                )}

                {cameraOpen && (
                  <div className="face-capture-container">
                    <div className={`camera-status ${faceDetectedAdmin ? 'status-success' : 'status-waiting'}`}>
                      {faceDetectedAdmin
                        ? 'Face detected'
                        : 'Position your face in the oval'}
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

                    <div className="button-group">
                      <button
                        type="button"
                        className="btn btn-primary capture-btn"
                        onClick={captureFace}
                        disabled={capturing || !faceDetectedAdmin}
                      >
                        {capturing ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }}>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            CAPTURING...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 8v8M8 12h8" />
                            </svg>
                            CAPTURE FACE
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger cancel-btn"
                        onClick={closeCamera}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {faceCaptured && (
                  <div className="alert alert-success face-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Face captured successfully
                  </div>
                )}
              </div>

              <button
  className="btn btn-primary submit-btn"
  onClick={handleAddStudent}
  disabled={adding}
>
  {adding ? (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      ADDING STUDENT...
    </>
  ) : (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      ADD STUDENT
    </>
  )}
</button>

              {/* View Registered Students Button - at the bottom */}
              <div className="view-students-container">
                <Link to="/admin/students/list" className="btn btn-outline view-students-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View Registered Students
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddStudent;