import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const faceapi = window.faceapi;
import Header from '../components/Header';
import Footer from '../components/Footer';
import { verifyFace } from '../services/authService';

const FaceRecognition = () => {
  const navigate = useNavigate();
  const [faceStatus, setFaceStatus] = useState('Loading face detection models...');
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);
  const modelsLoadedRef = useRef(false);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.3,
  });

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/student-login');
      return;
    }
    loadModels();
    return () => {
      cleanUpCamera();
      if (detectionRef.current) clearInterval(detectionRef.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      setFaceStatus('Loading face detection models...');
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoadedRef.current = true;
      setModelsLoaded(true);
      setFaceStatus('Models loaded — Starting camera...');
      initializeCamera();
    } catch (err) {
      console.error('Model loading error:', err);
      setError('Failed to load face detection models. Please refresh.');
      setFaceStatus('Model loading failed');
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setFaceStatus('Camera ready — Position your face in the oval');
          startFaceDetection();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please enable camera permissions.');
      setFaceStatus('Camera error');
    }
  };

  const startFaceDetection = () => {
    detectionRef.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoadedRef.current) return;
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, detectorOptions)
          .withFaceLandmarks();

        if (detection) {
          setFaceDetected(true);
          setFaceStatus('Face detected ✓ — Click Verify Identity');
        } else {
          setFaceDetected(false);
          setFaceStatus('No face detected — Position your face in the oval');
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 500);
  };

  const getFaceDescriptor = async () => {
    if (!videoRef.current) return null;
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        return Array.from(detection.descriptor);
      }
      return null;
    } catch (err) {
      console.error('Descriptor error:', err);
      return null;
    }
  };

  const cleanUpCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleVerify = async () => {
    if (!faceDetected) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      setError(`No face detected. Attempt ${newCount} of 3`);
      if (newCount >= 3) {
        setError('Maximum attempts reached. Returning home in 30 seconds...');
        startTimer();
      }
      return;
    }

    setLoading(true);
    setError('');
    setFaceStatus('Extracting face descriptor...');

    try {
      const descriptor = await getFaceDescriptor();

      if (!descriptor) {
        handleFailedAttempt();
        return;
      }

      setFaceStatus('Verifying identity...');
      const result = await verifyFace(descriptor, user?.regNo);

      if (result.success && result.verified) {
        setFaceStatus('Face verified successfully! ✓');
        sessionStorage.setItem('votingToken', result.token);
        if (detectionRef.current) clearInterval(detectionRef.current);
        setTimeout(() => {
          cleanUpCamera();
          navigate('/vote');
        }, 1500);
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError('An error occurred. Please try again.');
      setFaceStatus('Error occurred');
    }

    setLoading(false);
  };

  const handleFailedAttempt = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    setFaceStatus('Verification failed');
    setError(`Verification failed. Attempt ${newCount} of 3`);
    if (newCount >= 3) {
      setError('Maximum attempts reached. Returning home in 30 seconds...');
      startTimer();
    } else {
      setTimeout(() => {
        setFaceStatus('Ready to retry — position your face in the oval');
        setError('');
      }, 2000);
    }
  };

  const startTimer = () => {
    let timeLeft = 30;
    setRetryTimer(timeLeft);
    const interval = setInterval(() => {
      timeLeft--;
      setRetryTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        cleanUpCamera();
        navigate('/');
      }
    }, 1000);
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />
        <div className="screen-container">
          <div className="card wide-card">
            <h2>Face Recognition Verification</h2>
            <p className="helper-text">Position your face within the oval to continue</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="face-capture-container">
              <div className={`camera-status ${faceDetected ? 'status-success' : 'status-waiting'}`}>
                {faceStatus}
              </div>

              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="webcam"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className={`face-overlay ${faceDetected ? 'detected' : ''}`} />
              </div>

              <div className="attempt-counter">
                Attempts Remaining: <span className="count">{3 - attemptCount}</span>
              </div>

              {retryTimer !== null && (
                <div className="retry-timer">Returning home in {retryTimer}s...</div>
              )}
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={!cameraReady || !modelsLoaded || loading || retryTimer !== null}
              >
                {!modelsLoaded
                  ? 'LOADING MODELS...'
                  : loading
                  ? 'VERIFYING...'
                  : cameraReady
                  ? 'VERIFY IDENTITY'
                  : 'INITIALIZING CAMERA...'}
              </button>

              <p className="cancel-note">Cancelling will log you out of the voting session</p>
              <button
                className="btn btn-danger"
                onClick={() => {
                  cleanUpCamera();
                  sessionStorage.clear();
                  navigate('/');
                }}
              >
                CANCEL & LOGOUT
              </button>
            </div>

            <div className="security-note">
              Facial data is encrypted and used strictly for identity verification
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaceRecognition;