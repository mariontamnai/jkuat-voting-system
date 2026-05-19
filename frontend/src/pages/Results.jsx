import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ResultBar from "../components/ResultBar";
import { getResults } from "../services/voteService";

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(5);
  const [sessionEnded, setSessionEnded] = useState(
    sessionStorage.getItem("sessionStatus") === "ended",
  );

  const admin = JSON.parse(sessionStorage.getItem("admin"));

  useEffect(() => {
    loadResults();
    const interval = setInterval(() => {
      const status = sessionStorage.getItem("sessionStatus");
      if (status === "ended") {
        setSessionEnded(true);
        clearInterval(interval);
        return;
      }
      loadResults();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionEnded) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev === 1 ? 5 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionEnded]);

  const loadResults = async () => {
    const result = await getResults();
    if (result.success) {
      setResults(result.results);
      setLastUpdated(new Date());
      if (result.electionStatus === "completed") {
        setSessionEnded(true);
        sessionStorage.setItem("sessionStatus", "ended");
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    ["token", "votingToken", "user", "votedFor"].forEach((k) =>
      sessionStorage.removeItem(k),
    );
    navigate("/");
  };

  const formatTime = (date) => date.toLocaleTimeString();

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
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {!sessionEnded && (
                    <span
                      className="flex items-center gap-1.5 bg-red-500 text-white
                                     text-[0.6rem] font-black tracking-widest uppercase
                                     px-2.5 py-1 rounded-full"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  {sessionEnded && (
                    <span
                      className="bg-white/20 text-white/80 text-[0.6rem] font-black
                                     tracking-widest uppercase px-2.5 py-1 rounded-full"
                    >
                      ✅ Final
                    </span>
                  )}
                </div>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  {sessionEnded
                    ? "Final Election Results"
                    : "Live Election Results"}
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  {sessionEnded
                    ? "Session ended — results are official"
                    : `Auto-updating · next refresh in ${countdown}s`}
                </p>
              </div>
              <div className="text-4xl mt-1">🗳️</div>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8">
            {/* ── Loading ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-[#2d6a2d]"
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
                <p className="text-sm text-gray-400 font-medium">
                  Loading results...
                </p>
              </div>
            )}

            {!loading && results && (
              <>
                {/* ── Current leaders ── */}
                {results?.candidatesByPosition && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                    {Object.entries(results.candidatesByPosition).map(
                      ([position, candidates]) => (
                        <div
                          key={position}
                          className="bg-gradient-to-br from-[#f0faf0] to-[#e8f5e8]
                                   border border-green-200 rounded-xl p-4"
                        >
                          <p
                            className="text-[0.6rem] font-black text-[#2d6a2d] tracking-widest
                                      uppercase mb-1.5 flex items-center gap-1"
                          >
                            🏆 Leading · {position}
                          </p>
                          <p className="text-[#1a3a1a] font-black text-base leading-tight">
                            {candidates[0].name}
                          </p>
                          <p className="text-[#2d6a2d] text-xs font-bold mt-1">
                            {candidates[0].votes} votes
                            <span className="text-gray-400 font-normal ml-1">
                              ({candidates[0].percentage}%)
                            </span>
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* ── Stats grid ── */}
                <div className="grid grid-cols-3 gap-3 mb-7">
                  {[
                    {
                      value: results?.totalVotes,
                      label: "Votes Cast",
                      icon: "🗳️",
                    },
                    {
                      value: `${results?.turnout}%`,
                      label: "Turnout",
                      icon: "📊",
                      sub: `of ${results?.eligibleVoters}`,
                    },
                    {
                      value: results?.eligibleVoters,
                      label: "Eligible",
                      icon: "👥",
                    },
                  ].map(({ value, label, icon, sub }) => (
                    <div
                      key={label}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"
                    >
                      <div className="text-xl mb-1">{icon}</div>
                      <p className="text-[#1a3a1a] font-black text-lg leading-none">
                        {value}
                      </p>
                      {sub && (
                        <p className="text-gray-400 text-[0.6rem] mt-0.5">
                          {sub}
                        </p>
                      )}
                      <p
                        className="text-gray-400 text-[0.6rem] font-bold tracking-widest
                                    uppercase mt-1"
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Vote distribution ── */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-xs font-black text-[#1a3a1a] tracking-widest uppercase whitespace-nowrap">
                    Vote Distribution
                  </p>
                  <hr className="flex-1 border-gray-100" />
                </div>

                {results?.candidatesByPosition ? (
                  Object.entries(results.candidatesByPosition).map(
                    ([position, candidates]) => (
                      <div key={position} className="mb-7">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-[#2d6a2d]" />
                          <h4 className="text-sm font-black text-[#1a3a1a]">
                            {position}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {candidates.map((candidate, index) => (
                            <ResultBar
                              key={candidate.id}
                              candidate={candidate}
                              rank={index + 1}
                              isLeader={index === 0}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="space-y-2">
                    {results?.candidates.map((candidate, index) => (
                      <ResultBar
                        key={candidate.id}
                        candidate={candidate}
                        rank={index + 1}
                        isLeader={index === 0}
                      />
                    ))}
                  </div>
                )}

                {/* ── Footer meta ── */}
                <div
                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3
                                flex flex-col sm:flex-row sm:items-center sm:justify-between
                                gap-2 mt-6 mb-6"
                >
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>🕐</span>
                    <span>
                      Updated:{" "}
                      <span className="font-bold text-gray-600">
                        {formatTime(lastUpdated)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>🔄</span>
                    <span>
                      Next:{" "}
                      <span className="font-bold text-gray-600">
                        {sessionEnded ? "Stopped" : `${countdown}s`}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${sessionEnded ? "bg-gray-400" : "bg-red-500 animate-pulse"}`}
                    />
                    <span
                      className={`font-black tracking-widest uppercase text-[0.6rem]
                                      ${sessionEnded ? "text-gray-400" : "text-red-500"}`}
                    >
                      {sessionEnded ? "Ended" : "Live"}
                    </span>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 mb-5">
                  <hr className="flex-1 border-gray-100" />
                  <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                    Actions
                  </span>
                  <hr className="flex-1 border-gray-100" />
                </div>

                {/* ── Buttons ── */}
                <div className="flex flex-col gap-3">
                  {admin && (
                    <button
                      onClick={() => navigate("/admin/dashboard")}
                      className="w-full py-3.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                                 text-white text-xs font-black tracking-widest uppercase
                                 transition-colors duration-150 cursor-pointer
                                 flex items-center justify-center gap-2"
                    >
                      🏠 Back to Dashboard
                    </button>
                  )}
                  {!admin && (
                    <button
                      onClick={() => navigate("/")}
                      className="w-full py-3.5 rounded-lg border border-[#2d6a2d]/25
                                 text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                                 hover:bg-green-50 hover:border-[#2d6a2d]/50
                                 transition-colors duration-150 cursor-pointer"
                    >
                      ← Back to Home
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 rounded-lg border border-red-200
                               text-red-500 text-xs font-black tracking-widest uppercase
                               hover:bg-red-50 hover:border-red-300
                               transition-colors duration-150 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
