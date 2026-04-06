import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { verifyFace } from '../services/authService';

const FaceRecognition = () => {
  const navigate = useNavigate();
  const [faceStatus, setFaceStatus] = useState('Initializing...');
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/student-login');
      return;
    }
    initializeCamera();
    return () => {
      cleanUpCamera();
      if (detectionRef.current) clearInterval(detectionRef.current);
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setFaceStatus('Accessing camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
        setFaceStatus('Camera ready — Position your face in the oval');
        startFaceDetection();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setFaceStatus('Camera error');
    }
  };

  const startFaceDetection = () => {
    detectionRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(
        canvas.width * 0.25,
        canvas.height * 0.1,
        canvas.width * 0.5,
        canvas.height * 0.8
      );

      const detected = hasSkinTone(imageData.data);
      setFaceDetected(detected);

      if (detected) {
        setFaceStatus('Face detected ✓ — Click Verify Identity');
      } else {
        setFaceStatus('No face detected — Position your face in the oval');
      }
    }, 500);
  };

  
  const hasSkinTone = (pixels) => {
    let skinPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      
      if (
        r > 60 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 10 &&
        r - b > 10
      ) {
        skinPixels++;
      }
    }

    const skinRatio = skinPixels / totalPixels;
    return skinRatio > 0.08; 
  };

  const cleanUpCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFaceImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  const handleVerify = async () => {
    if (!faceDetected) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      setError(`No face detected. Attempt ${newCount} of 3`);

      if (newCount >= 3) {
        setError('Maximum attempts reached. Returning home in 30 seconds...');
        start30SecondTimer();
      }
      return;
    }

    setLoading(true);
    setError('');
    setFaceStatus('Verifying...');

    try {
      const imageBlob = await captureFaceImage();
      const result = await verifyFace(imageBlob, user?.regNo);

      if (result.success && result.verified) {
        setFaceStatus('Face verified successfully! ✓');
        if (detectionRef.current) clearInterval(detectionRef.current);

        setTimeout(() => {
          cleanUpCamera();
          sessionStorage.setItem('token', result.token);
          navigate('/vote');
        }, 1500);
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
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
      start30SecondTimer();
    } else {
      setTimeout(() => {
        setFaceStatus('Ready to retry — position your face in the oval');
        setError('');
      }, 2000);
    }
  };

  const start30SecondTimer = () => {
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
                disabled={!cameraReady || loading || retryTimer !== null}
              >
                {loading ? 'VERIFYING...' : cameraReady ? 'VERIFY IDENTITY' : 'INITIALIZING CAMERA...'}
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