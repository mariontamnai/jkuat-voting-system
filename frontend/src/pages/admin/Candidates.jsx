import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getElections } from "../../services/adminService";

const Candidates = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(
    sessionStorage.getItem("electionId") || "",
  );

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const phase = sessionStorage.getItem("adminPhase") || "idle";
  const isLocked = phase !== "idle";

  const selectedElectionData = elections.find((e) => e.id === selectedElection);

  useEffect(() => {
    if (!admin) {
      navigate("/admin-login");
      return;
    }
    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);
    const result = await getElections();
    if (result.success) {
      setElections(result.elections);
      const savedId = sessionStorage.getItem("electionId");
      if (savedId) setSelectedElection(savedId);
    }
    setLoading(false);
  };

  const handleElectionChange = (e) => {
    setSelectedElection(e.target.value);
    sessionStorage.setItem("electionId", e.target.value);
  };

  const statusConfig = {
    active: {
      pill: "bg-green-100 text-green-700 border border-green-200",
      dot: "bg-green-500",
    },
    completed: {
      pill: "bg-gray-100 text-gray-500 border border-gray-200",
      dot: "bg-gray-400",
    },
    pending: {
      pill: "bg-amber-100 text-amber-700 border border-amber-200",
      dot: "bg-amber-400",
    },
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
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  👤 Admin Panel
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Manage Candidates
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Add or view candidates for an election
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="shrink-0 mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                           text-white text-xs font-bold tracking-widest uppercase
                           hover:bg-white/20 transition-colors cursor-pointer"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="px-8 py-7">
            {/* ── Select election ── */}
            <div className="mb-6">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                Select Election
              </label>

              {loading ? (
                <div
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100
                                rounded-lg px-4 py-3"
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
                  <span className="text-xs text-gray-400 font-medium">
                    Loading elections...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedElection}
                  onChange={handleElectionChange}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200
                             text-sm outline-none
                             focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                             cursor-pointer transition-all duration-150"
                >
                  <option value="">— Select an election —</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title} ({election.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Selected election info chip ── */}
            {selectedElectionData && (
              <div
                className="flex items-center justify-between bg-gray-50 border border-gray-100
                              rounded-xl px-4 py-3 mb-6"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <div>
                    <p className="text-xs font-black text-[#1a3a1a]">
                      {selectedElectionData.title}
                    </p>
                    <p className="text-[0.6rem] text-gray-400 mt-0.5">
                      Selected election
                    </p>
                  </div>
                </div>
                {selectedElectionData.status &&
                  (() => {
                    const cfg =
                      statusConfig[selectedElectionData.status.toLowerCase()] ||
                      statusConfig.pending;
                    return (
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                     text-[0.6rem] font-black tracking-widest uppercase ${cfg.pill}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {selectedElectionData.status}
                      </span>
                    );
                  })()}
              </div>
            )}

            {/* ── Locked warning ── */}
            {isLocked && (
              <div
                className="flex items-start gap-3 bg-amber-50 border border-amber-200
                              rounded-xl px-4 py-3.5 mb-6"
              >
                <span className="text-lg mt-0.5">⚠️</span>
                <div>
                  <p className="text-xs font-black text-amber-700 tracking-wide mb-0.5">
                    Modifications Locked
                  </p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Candidates cannot be added or edited while a voting session
                    is active. End the session first to make changes.
                  </p>
                </div>
              </div>
            )}

            {/* ── Action buttons ── */}
            {selectedElection && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <hr className="flex-1 border-gray-100" />
                  <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                    Actions
                  </span>
                  <hr className="flex-1 border-gray-100" />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/admin/candidates/create")}
                    disabled={isLocked}
                    className="w-full py-3.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                               text-white text-xs font-black tracking-widest uppercase
                               cursor-pointer transition-colors duration-150
                               flex items-center justify-center gap-2
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ➕ Add Candidate
                  </button>

                  <button
                    onClick={() => navigate("/admin/candidates/list")}
                    className="w-full py-3.5 rounded-lg border border-[#2d6a2d]/25
                               text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                               hover:bg-green-50 hover:border-[#2d6a2d]/50
                               transition-colors duration-150 cursor-pointer
                               flex items-center justify-center gap-2"
                  >
                    👥 View All Candidates
                  </button>
                </div>
              </>
            )}

            {/* ── Empty prompt ── */}
            {!selectedElection && !loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-4xl">📋</span>
                <p className="text-sm font-bold text-gray-400">
                  Select an election to get started
                </p>
                <p className="text-xs text-gray-300">
                  Action buttons will appear here
                </p>
              </div>
            )}

            <p
              className="flex items-center justify-center gap-1.5 mt-6
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Admin access · Changes are logged
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Candidates;
