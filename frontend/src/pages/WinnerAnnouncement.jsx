import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ResultBar from "../components/ResultBar";
import { getResults } from "../services/voteService";

const WinnerAnnouncement = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(sessionStorage.getItem("admin"));

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const result = await getResults();
    if (result.success) setResults(result.results);
    setLoading(false);
  };

  const handleLogout = () => {
    ["token", "votingToken", "user", "votedFor"].forEach((k) =>
      sessionStorage.removeItem(k),
    );
    navigate("/");
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
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-amber-400/20
                                 text-amber-300 border border-amber-400/30
                                 text-[0.6rem] font-black tracking-widest uppercase
                                 px-2.5 py-1 rounded-full mb-2"
                >
                  ✅ Official Results
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Winner Announcement
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  JKUSA Student Leaders Election — Final & Official
                </p>
              </div>
              <div className="text-4xl mt-1">🏆</div>
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
                {/* ── Winner cards per position ── */}
                {results?.candidatesByPosition ? (
                  Object.entries(results.candidatesByPosition).map(
                    ([position, candidates], idx, arr) => {
                      const winner = candidates[0];
                      const positionTotalVotes = candidates.reduce(
                        (sum, c) => sum + c.votes,
                        0,
                      );
                      const winnerPercentage =
                        positionTotalVotes > 0
                          ? parseFloat(
                              (
                                (winner.votes / positionTotalVotes) *
                                100
                              ).toFixed(1),
                            )
                          : 0;
                      return (
                        <div
                          key={position}
                          className={`mb-5 ${idx < arr.length - 1 ? "pb-5 border-b border-gray-100" : ""}`}
                        >
                          {/* Winner card */}
                          <div
                            className="bg-gradient-to-br from-amber-50 to-yellow-50
                                          border border-amber-200 rounded-2xl px-6 py-5 mb-4
                                          relative overflow-hidden"
                          >
                            {/* Decorative bg trophy */}
                            <div
                              className="absolute right-4 top-1/2 -translate-y-1/2
                                            text-7xl opacity-[0.07] select-none pointer-events-none"
                            >
                              🏆
                            </div>

                            <div className="flex items-start gap-4 relative">
                              {/* Trophy badge */}
                              <div
                                className="w-14 h-14 rounded-2xl bg-amber-400/20
                                              border border-amber-300/40
                                              flex items-center justify-center text-2xl shrink-0"
                              >
                                🏆
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-[0.6rem] font-black text-amber-600
                                              tracking-widest uppercase mb-1"
                                >
                                  Winner · {position}
                                </p>
                                <h3
                                  className="text-xl font-black text-[#1a3a1a] tracking-tight
                                               leading-tight truncate"
                                >
                                  {winner?.name}
                                </h3>
                                {winner?.faculty && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {winner.faculty}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Winner stats */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {[
                                { value: winner?.votes, label: "Votes" },
                                {
                                  value: `${winnerPercentage}%`,
                                  label: "Share",
                                },
                                {
                                  value: `${results?.turnout}%`,
                                  label: "Turnout",
                                },
                              ].map(({ value, label }) => (
                                <div
                                  key={label}
                                  className="bg-white/70 border border-amber-200/60
                                             rounded-xl py-2.5 text-center"
                                >
                                  <p className="text-lg font-black text-[#1a3a1a] leading-none">
                                    {value}
                                  </p>
                                  <p
                                    className="text-[0.6rem] font-bold text-amber-600
                                                tracking-widest uppercase mt-1"
                                  >
                                    {label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* All candidates for this position */}
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
                      );
                    },
                  )
                ) : (
                  <>
                    {/* Single winner fallback */}
                    <div
                      className="bg-gradient-to-br from-amber-50 to-yellow-50
                                      border border-amber-200 rounded-2xl px-6 py-5 mb-6
                                      relative overflow-hidden"
                    >
                      <div
                        className="absolute right-4 top-1/2 -translate-y-1/2
                                        text-7xl opacity-[0.07] select-none pointer-events-none"
                      >
                        🏆
                      </div>
                      <div className="flex items-start gap-4 relative">
                        <div
                          className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40
                                          flex items-center justify-center text-2xl shrink-0"
                        >
                          🏆
                        </div>
                        <div>
                          <p className="text-[0.6rem] font-black text-amber-600 tracking-widest uppercase mb-1">
                            Winner
                          </p>
                          <h3 className="text-xl font-black text-[#1a3a1a] tracking-tight">
                            {results?.candidates[0]?.name}
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {[
                          {
                            value: results?.candidates[0]?.votes,
                            label: "Votes",
                          },
                          {
                            value: `${results?.candidates[0]?.percentage}%`,
                            label: "Share",
                          },
                          { value: `${results?.turnout}%`, label: "Turnout" },
                        ].map(({ value, label }) => (
                          <div
                            key={label}
                            className="bg-white/70 border border-amber-200/60 rounded-xl py-2.5 text-center"
                          >
                            <p className="text-lg font-black text-[#1a3a1a] leading-none">
                              {value}
                            </p>
                            <p
                              className="text-[0.6rem] font-bold text-amber-600
                                            tracking-widest uppercase mt-1"
                            >
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      {results?.candidates.map((candidate, index) => (
                        <ResultBar
                          key={candidate.id}
                          candidate={candidate}
                          rank={index + 1}
                          isLeader={index === 0}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* ── Overall stats ── */}
                <div className="flex items-center gap-3 my-6">
                  <hr className="flex-1 border-gray-100" />
                  <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                    Election Summary
                  </span>
                  <hr className="flex-1 border-gray-100" />
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden mb-6">
                  {[
                    {
                      label: "Voters Participated",
                      value: results?.totalVotes,
                      icon: "🗳️",
                    },
                    {
                      label: "Eligible Voters",
                      value: results?.eligibleVoters,
                      icon: "👥",
                    },
                    {
                      label: "Voter Turnout",
                      value: `${results?.turnout}%`,
                      icon: "📊",
                    },
                    {
                      label: "Election Status",
                      value: "✅ Official",
                      icon: "🏛️",
                      highlight: true,
                    },
                  ].map(({ label, value, icon, highlight }, i, arr) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between px-4 py-3
                                  ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{icon}</span>
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          highlight ? "text-[#2d6a2d]" : "text-[#1a3a1a]"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
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
                                 cursor-pointer transition-colors duration-150
                                 flex items-center justify-center gap-2"
                    >
                      🏠 Back to Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-3.5 rounded-lg border border-[#2d6a2d]/25
                               text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                               hover:bg-green-50 hover:border-[#2d6a2d]/50
                               transition-colors duration-150 cursor-pointer"
                  >
                    ← Back to Home
                  </button>
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

                <p
                  className="flex items-center justify-center gap-1.5 mt-5
                              text-[0.68rem] text-gray-300 font-light"
                >
                  🔒 Results verified and encrypted with AES-256
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WinnerAnnouncement;
