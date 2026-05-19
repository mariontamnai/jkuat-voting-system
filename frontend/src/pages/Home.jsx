import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import config from "../config";

const Home = () => {
  const navigate = useNavigate();
  const [electionStatus, setElectionStatus] = useState(null);
  const [electionId, setElectionId] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    checkElectionStatus();
  }, []);

  const checkElectionStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/admin/elections`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const active = data.find((e) => e.status === "active");
        const completed = data.find((e) => e.status === "completed");
        if (active) {
          setElectionStatus("active");
          setElectionId(active._id);
        } else if (completed) {
          setElectionStatus("completed");
          setElectionId(completed._id);
        }
      }
    } catch (err) {
      console.error("Election status check failed:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleViewResults = () => {
    sessionStorage.setItem("electionId", electionId);
    navigate("/results");
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

      {/* Badges */}
      <div className="flex flex-wrap gap-2 justify-center px-4 pb-6">
        {[
          "🔒 AES-256 Encrypted",
          "🪪 Biometric Verified",
          "✅ One Person, One Vote",
        ].map((label) => (
          <span
            key={label}
            className="bg-gradient-to-br from-[#2d6a2d] to-[#1f521f] text-[#c8e6c8]
                       text-xs font-semibold tracking-widest uppercase
                       px-4 py-1.5 rounded-full shadow-md"
          >
            {label}
          </span>
        ))}
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pb-8">
        <div
          className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl
                     border border-green-100 overflow-hidden px-7 py-10 sm:px-10"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1
                          bg-gradient-to-r from-[#2d6a2d] via-[#5aaa5a] to-[#2d6a2d]"
          />

          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1a3a1a]
                         text-center leading-snug mb-3"
          >
            Welcome to JKUSA Student Leaders Election
          </h2>

          <p
            className="text-sm text-[#4a6a4a] text-center leading-relaxed
                        max-w-md mx-auto mb-6"
          >
            A secure biometric-based online voting platform for JKUSA student
            elections. Identity verification is performed using facial
            recognition and AES-256 encryption before vote submission.
          </p>

          {/* ── Election status ── */}
          {statusLoading ? (
            <div
              className="flex items-center justify-center gap-3 rounded-xl
                            bg-gray-50 border border-gray-100 px-4 py-3.5 mb-6"
            >
              <svg
                className="animate-spin h-4 w-4 text-[#2d6a2d] shrink-0"
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
              <span className="text-xs font-semibold text-gray-400 tracking-wide">
                Checking election status...
              </span>
            </div>
          ) : (
            <>
              {electionStatus === "active" && (
                <div
                  className="flex items-center justify-center gap-2 rounded-xl
                                bg-green-50 border-2 border-green-400
                                text-green-800 font-semibold text-sm
                                px-4 py-3 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span> 🗳️</span> Voting is currently open!
                </div>
              )}
              {electionStatus === "completed" && (
                <div
                  className="flex items-center justify-center gap-2 rounded-xl
                                bg-green-50 border-2 border-green-400
                                text-green-800 font-semibold text-sm
                                px-4 py-3 mb-6"
                >
                  <span> ✅ </span> Election has ended. Results are available!
                </div>
              )}
              {electionStatus === null && (
                <div
                  className="flex items-center justify-center gap-2 rounded-xl
                                bg-amber-50 border border-amber-200
                                text-amber-700 font-semibold text-sm
                                px-4 py-3 mb-6"
                >
                  📭 No active election at the moment
                </div>
              )}
            </>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <hr className="flex-1 border-green-100" />
            <span className="text-xs text-green-400 tracking-widest uppercase">
              Access Portal
            </span>
            <hr className="flex-1 border-green-100" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/student-login")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#2d6a2d] to-[#1f521f]
                         text-white text-xs font-bold tracking-widest uppercase
                         shadow-lg shadow-green-900/25 cursor-pointer
                         transition-all duration-150 hover:-translate-y-0.5
                         hover:shadow-xl hover:shadow-green-900/35
                         flex items-center justify-center gap-2"
            >
              🎓 Student Login
            </button>

            <button
              onClick={() => navigate("/admin-login")}
              className="w-full py-3.5 rounded-xl bg-transparent
                         text-[#2d6a2d] text-xs font-bold tracking-widest uppercase
                         border-2 border-[#2d6a2d]/30 cursor-pointer
                         transition-all duration-150 hover:-translate-y-0.5
                         hover:bg-green-50 hover:border-[#2d6a2d]
                         flex items-center justify-center gap-2"
            >
              🔐 Admin Login
            </button>

            {(electionStatus === "active" ||
              electionStatus === "completed") && (
              <button
                onClick={handleViewResults}
                className="w-full py-3 rounded-xl bg-transparent
                           text-[#2d6a2d] text-xs font-bold tracking-widest uppercase
                           cursor-pointer transition-all duration-150
                           hover:bg-green-50
                           flex items-center justify-center gap-2"
              >
                📊 View Election Results
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
