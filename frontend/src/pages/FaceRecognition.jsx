import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { verifyFace } from "../services/authService";

const faceapi = window.faceapi;

const FaceRecognition = () => {
  const navigate = useNavigate();
  const [faceStatus, setFaceStatus] = useState(
    "Loading face detection models...",
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [initStage, setInitStage] = useState("models"); // models | camera | ready

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);
  const modelsLoadedRef = useRef(false);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.3,
  });

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/student-login");
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
      setFaceStatus("Loading face detection models...");
      setInitStage("models");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoadedRef.current = true;
      setModelsLoaded(true);
      setInitStage("camera");
      setFaceStatus("Models loaded — Starting camera...");
      initializeCamera();
    } catch (err) {
      console.error("Model loading error:", err);
      setError("Failed to load face detection models. Please refresh.");
      setFaceStatus("Model loading failed");
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setInitStage("ready");
          setFaceStatus("Camera ready — Position your face in the oval");
          startFaceDetection();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please enable camera permissions.");
      setFaceStatus("Camera error");
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
          setFaceStatus("Face detected — Click Verify Identity");
        } else {
          setFaceDetected(false);
          setFaceStatus("No face detected — Position your face in the oval");
        }
      } catch (err) {
        console.error("Detection error:", err);
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
      return detection ? Array.from(detection.descriptor) : null;
    } catch (err) {
      console.error("Descriptor error:", err);
      return null;
    }
  };

  const cleanUpCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleVerify = async () => {
    if (!faceDetected) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      setError(`No face detected. Attempt ${newCount} of 3`);
      if (newCount >= 3) {
        setError("Maximum attempts reached. Returning home in 30 seconds...");
        startTimer();
      }
      return;
    }
    setLoading(true);
    setError("");
    setFaceStatus("Extracting face descriptor...");
    try {
      const descriptor = await getFaceDescriptor();
      if (!descriptor) {
        handleFailedAttempt();
        setLoading(false);
        return;
      }
      setFaceStatus("Verifying identity...");
      const result = await verifyFace(descriptor, user?.regNo);
      if (result.success && result.verified) {
        setFaceStatus("Face verified successfully! ✓");
        sessionStorage.setItem("votingToken", result.token);
        if (detectionRef.current) clearInterval(detectionRef.current);
        setTimeout(() => {
          cleanUpCamera();
          navigate("/vote");
        }, 1500);
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
      console.error("Verify error:", err);
      setError("An error occurred. Please try again.");
      setFaceStatus("Error occurred");
    }
    setLoading(false);
  };

  const handleFailedAttempt = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    setFaceStatus("Verification failed");
    setError(`Verification failed. Attempt ${newCount} of 3`);
    if (newCount >= 3) {
      setError("Maximum attempts reached. Returning home in 30 seconds...");
      startTimer();
    } else {
      setTimeout(() => {
        setFaceStatus("Ready to retry — position your face in the oval");
        setError("");
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
        navigate("/");
      }
    }, 1000);
  };

  const attemptsLeft = 3 - attemptCount;
  const isLocked = retryTimer !== null;
  const isVerified = faceStatus.includes("verified successfully");

  const buttonLabel = () => {
    if (!modelsLoaded) return "Loading Models...";
    if (!cameraReady) return "Initializing Camera...";
    if (loading) return "Verifying...";
    return "Verify Identity";
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#e8f0e8]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, #c5dbc5 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 90% 80%, #d0e8d0 0%, transparent 60%)
        `,
      }}
    >
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  🪪 Biometric Verification
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Face Recognition
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Verify your identity to access the ballot
                </p>
              </div>
              <div className="text-4xl mt-1">👤</div>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8">
            {/* ── Init progress steps ── */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { key: "models", label: "Load Models", icon: "🧠" },
                { key: "camera", label: "Start Camera", icon: "📷" },
                { key: "ready", label: "Ready", icon: "✅" },
              ].map((s, idx, arr) => {
                const stageOrder = { models: 0, camera: 1, ready: 2 };
                const currentOrder = stageOrder[initStage] ?? 0;
                const isDone = stageOrder[s.key] < currentOrder;
                const isCurrent = s.key === initStage;
                return (
                  <React.Fragment key={s.key}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center
                                       text-xs font-black border transition-all
                                       ${
                                         isDone
                                           ? "bg-[#2d6a2d] border-[#2d6a2d] text-white"
                                           : isCurrent
                                             ? "bg-white border-[#2d6a2d] text-[#2d6a2d]"
                                             : "bg-gray-100 border-gray-200 text-gray-300"
                                       }`}
                      >
                        {isDone ? "✓" : s.icon}
                      </div>
                      <span
                        className={`text-[0.6rem] font-bold hidden sm:block
                                        ${isCurrent ? "text-[#2d6a2d]" : isDone ? "text-gray-400" : "text-gray-300"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 rounded-full transition-all
                                       ${isDone ? "bg-[#2d6a2d]" : "bg-gray-200"}`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── Error ── */}
            {error && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                               font-semibold mb-5 border
                               ${
                                 isLocked
                                   ? "bg-red-50 border-red-300 text-red-700"
                                   : "bg-amber-50 border-amber-200 text-amber-700"
                               }`}
              >
                <span>{isLocked ? "🔒" : "⚠️"}</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Camera + status ── */}
            <div className="flex flex-col items-center mb-6">
              {/* Status pill */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border
                               text-xs font-bold mb-4 transition-all duration-300
                               ${
                                 isVerified
                                   ? "bg-green-100 border-green-300 text-green-700"
                                   : faceDetected
                                     ? "bg-green-50 border-green-200 text-green-600"
                                     : "bg-gray-50 border-gray-200 text-gray-500"
                               }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0
                                  ${
                                    isVerified
                                      ? "bg-green-500"
                                      : faceDetected
                                        ? "bg-green-400 animate-pulse"
                                        : "bg-gray-300 animate-pulse"
                                  }`}
                />
                {faceStatus}
              </div>

              {/* Video frame */}
              <div className="relative w-full max-w-sm">
                {/* Oval overlay */}
                <div
                  className="relative rounded-2xl overflow-hidden bg-gray-900
                                border-2 border-gray-200 aspect-video"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Oval guide */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center
                                   pointer-events-none`}
                  >
                    <div
                      className={`w-36 h-48 rounded-full border-4 transition-all duration-300
                                     ${
                                       isVerified
                                         ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                                         : faceDetected
                                           ? "border-green-400"
                                           : "border-white/50 border-dashed"
                                     }`}
                    />
                  </div>

                  {/* Corner brackets */}
                  {[
                    "top-2 left-2",
                    "top-2 right-2",
                    "bottom-2 left-2",
                    "bottom-2 right-2",
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute ${pos} w-5 h-5
                                             ${faceDetected ? "border-green-400" : "border-white/40"}
                                             ${
                                               i === 0
                                                 ? "border-t-2 border-l-2"
                                                 : i === 1
                                                   ? "border-t-2 border-r-2"
                                                   : i === 2
                                                     ? "border-b-2 border-l-2"
                                                     : "border-b-2 border-r-2"
                                             }`}
                    />
                  ))}

                  {/* Camera not ready overlay */}
                  {!cameraReady && (
                    <div
                      className="absolute inset-0 bg-gray-900/80 flex flex-col
                                    items-center justify-center gap-3"
                    >
                      <svg
                        className="animate-spin h-8 w-8 text-white/60"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      <p className="text-white/60 text-xs font-medium">
                        {initStage === "models"
                          ? "Loading models..."
                          : "Starting camera..."}
                      </p>
                    </div>
                  )}

                  {/* Verified overlay */}
                  {isVerified && (
                    <div
                      className="absolute inset-0 bg-green-900/30 flex items-center
                                    justify-center"
                    >
                      <div
                        className="w-16 h-16 rounded-full bg-green-500/80 flex items-center
                                      justify-center text-white text-3xl"
                      >
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Attempts tracker ── */}
            <div
              className="flex items-center justify-between bg-gray-50 border border-gray-100
                            rounded-xl px-4 py-3 mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🔁</span>
                <p className="text-xs font-bold text-gray-500">
                  Attempts Remaining
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all
                                ${
                                  i < attemptsLeft
                                    ? "bg-[#2d6a2d]"
                                    : "bg-gray-200"
                                }`}
                  />
                ))}
                <span
                  className={`text-xs font-black ml-1
                                  ${
                                    attemptsLeft === 1
                                      ? "text-red-500"
                                      : attemptsLeft === 2
                                        ? "text-amber-500"
                                        : "text-[#2d6a2d]"
                                  }`}
                >
                  {attemptsLeft}/3
                </span>
              </div>
            </div>

            {/* ── Countdown timer ── */}
            {retryTimer !== null && (
              <div
                className="flex items-center justify-between bg-red-50 border border-red-200
                              rounded-xl px-4 py-3 mb-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">⏱️</span>
                  <p className="text-xs font-bold text-red-600">
                    Returning to home
                  </p>
                </div>
                <span className="text-lg font-black text-red-600">
                  {retryTimer}s
                </span>
              </div>
            )}

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Actions
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Verify button ── */}
            <button
              onClick={handleVerify}
              disabled={
                !cameraReady ||
                !modelsLoaded ||
                loading ||
                isLocked ||
                isVerified
              }
              className={`w-full py-3.5 rounded-lg text-white text-xs font-black
                          tracking-widest uppercase cursor-pointer transition-all duration-150
                          flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            faceDetected && !loading
                              ? "bg-[#1a3a1a] hover:bg-[#152e15] shadow-lg shadow-green-900/20"
                              : "bg-gray-400"
                          }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  {faceDetected ? "🪪" : "👤"} {buttonLabel()}
                </>
              )}
            </button>

            {/* ── Cancel ── */}
            <div className="mt-3">
              <p className="text-center text-xs text-gray-300 mb-2">
                Cancelling will log you out of your voting session
              </p>
              <button
                onClick={() => {
                  cleanUpCamera();
                  sessionStorage.clear();
                  navigate("/");
                }}
                className="w-full py-3.5 rounded-lg border border-red-200 text-red-500
                           text-xs font-black tracking-widest uppercase
                           hover:bg-red-50 hover:border-red-300
                           transition-colors duration-150 cursor-pointer"
              >
                🚪 Cancel & Logout
              </button>
            </div>

            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light text-center"
            >
              🔒 Facial data is encrypted and used strictly for identity
              verification
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FaceRecognition;
