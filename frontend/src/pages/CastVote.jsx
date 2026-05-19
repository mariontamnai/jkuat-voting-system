import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CandidateCard from "../components/CandidateCard";
import { getCandidates, castVote } from "../services/voteService";

const CastVote = () => {
  const navigate = useNavigate();
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votedPositions, setVotedPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      navigate("/student-login");
      return;
    }
    if (user.hasVoted) {
      navigate("/vote-submitted");
      return;
    }
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const result = await getCandidates();
    if (result.success) {
      const grouped = {};
      result.candidates.forEach((candidate) => {
        const position = candidate.faculty;
        if (!grouped[position]) grouped[position] = [];
        grouped[position].push(candidate);
      });
      setCandidatesByPosition(grouped);
      setPositions(Object.keys(grouped));
    }
    setLoading(false);
  };

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = candidatesByPosition[currentPosition] || [];
  const isLastPosition = currentPositionIndex === positions.length - 1;
  const progressPercent =
    positions.length > 0
      ? Math.round((currentPositionIndex / positions.length) * 100)
      : 0;

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate before submitting");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await castVote(selectedCandidate.id);
    if (result.success) {
      setVotedPositions(result.votedPositions);
      if (result.allPositionsVoted) {
        const updatedUser = { ...user, hasVoted: true };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        sessionStorage.setItem("votedFor", JSON.stringify(selectedCandidate));
        navigate("/vote-submitted");
      } else {
        setSelectedCandidate(null);
        setCurrentPositionIndex((prev) => prev + 1);
      }
    } else {
      setError(result.message || "Failed to cast vote. Please try again.");
    }
    setSubmitting(false);
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
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex items-center gap-1.5 bg-green-500/30 text-green-200
                                   text-[0.6rem] font-black tracking-widest uppercase
                                   px-2.5 py-1 rounded-full border border-green-400/30"
                  >
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    Voting Open
                  </span>
                </div>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Cast Your Vote
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Your vote is{" "}
                  <span className="text-white/80 font-semibold">
                    end-to-end encrypted
                  </span>{" "}
                  and cannot be modified once submitted
                </p>
              </div>
              <div className="text-4xl mt-1">🗳️</div>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8">
            {/* ── Voter info strip ── */}
            <div
              className="flex flex-wrap items-center justify-between gap-3
                            bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-bold text-gray-400 tracking-widest uppercase">
                  Voter ID
                </span>
                <span className="text-xs font-black text-[#1a3a1a] font-mono">
                  ****{user?.regNo?.slice(-4)}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-bold text-gray-400 tracking-widest uppercase">
                  Session
                </span>
                <span className="text-xs font-black text-[#1a3a1a] font-mono">
                  ****{token?.slice(-6)}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[0.6rem] font-black text-amber-600 tracking-widest uppercase">
                  Not Voted
                </span>
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-700 rounded-lg px-4 py-3 text-sm font-semibold mb-5"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Progress ── */}
            {positions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#1a3a1a]">
                    Position{" "}
                    <span className="text-[#2d6a2d]">
                      {currentPositionIndex + 1}
                    </span>{" "}
                    of{" "}
                    <span className="text-[#2d6a2d]">{positions.length}</span>
                  </p>
                  <p className="text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase">
                    {progressPercent}% complete
                  </p>
                </div>

                {/* Segment bar */}
                <div className="flex gap-1.5">
                  {positions.map((pos, i) => (
                    <div
                      key={pos}
                      title={pos}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                        i < currentPositionIndex
                          ? "bg-[#2d6a2d]"
                          : i === currentPositionIndex
                            ? "bg-[#5aaa5a]"
                            : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Step labels */}
                <div className="flex mt-2 gap-1.5">
                  {positions.map((pos, i) => (
                    <div key={pos} className="flex-1 text-center">
                      <p
                        className={`text-[0.55rem] font-bold truncate tracking-wide
                                     transition-colors duration-200 ${
                                       i < currentPositionIndex
                                         ? "text-[#2d6a2d]"
                                         : i === currentPositionIndex
                                           ? "text-[#2d6a2d] font-black"
                                           : "text-gray-300"
                                     }`}
                      >
                        {pos.length > 10 ? pos.slice(0, 10) + "…" : pos}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Current position heading ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full bg-[#2d6a2d]" />
              <h3 className="text-base font-black text-[#1a3a1a] tracking-tight">
                {currentPosition || "Loading..."}
              </h3>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Candidates ── */}
            {loading ? (
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
                  Loading candidates...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {currentCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={selectedCandidate?.id === candidate.id}
                    onSelect={setSelectedCandidate}
                  />
                ))}
              </div>
            )}

            {/* ── Selection confirmation ── */}
            {selectedCandidate && (
              <div
                className="flex items-center gap-3 bg-green-50 border border-green-200
                              rounded-xl px-4 py-3 mb-5"
              >
                <span className="text-lg">✅</span>
                <div>
                  <p className="text-xs font-black text-[#2d6a2d] tracking-wide">
                    Candidate Selected
                  </p>
                  <p className="text-sm font-bold text-[#1a3a1a] mt-0.5">
                    {selectedCandidate.name}
                  </p>
                </div>
              </div>
            )}

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                {isLastPosition ? "Final Vote" : "Next Position"}
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Submit button ── */}
            <button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || submitting}
              className="w-full py-3.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                         text-white text-xs font-black tracking-widest uppercase
                         cursor-pointer transition-colors duration-150
                         flex items-center justify-center gap-2
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Submitting...
                </>
              ) : isLastPosition ? (
                "🗳️ Submit Final Vote"
              ) : (
                "→ Submit & Next Position"
              )}
            </button>

            {!selectedCandidate && !loading && (
              <p className="text-center text-xs text-gray-300 mt-3">
                Select a candidate above to continue
              </p>
            )}

            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Vote encrypted with AES-256 before submission
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CastVote;
