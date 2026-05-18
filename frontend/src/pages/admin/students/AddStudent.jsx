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
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [emailError, setEmailError] = useState(false);

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

        showMessage('Face captured successfully!', 'success');

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

      const distance = faceapi.euclideanDistance(
        faceDescriptor,
        existing.faceDescriptor
      );

      if (distance < threshold) {
        showMessage(
          `This face already belongs to ${existing.name}`,
          'error'
        );

        return;
      }
    }

    const result = await addStudent({
      ...studentForm,
      faceDescriptor
    });

    if (result.success) {
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

    } else {
      showMessage(result.message || 'Failed to add student', 'error');
    }
  };

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

              <h2>Add Student</h2>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Link to="/admin/students/list" className="btn btn-outline">
                View Registered Students
              </Link>
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
                <div className="input-wrapper">
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
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="capture-section">
                <label className="form-label">Student Face</label>

                {!cameraOpen && !faceCaptured && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={openCamera}
                  >
                    OPEN CAMERA
                  </button>
                )}

                {cameraOpen && (
                  <div className="face-capture-container">

                    <div className={`camera-status ${faceDetectedAdmin ? 'status-success' : 'status-waiting'}`}>
                      {faceDetectedAdmin
                        ? 'Face detected ✓'
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
                    Face captured successfully!
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary submit-btn"
                onClick={handleAddStudent}
              >
                ADD STUDENT
              </button>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddStudent;