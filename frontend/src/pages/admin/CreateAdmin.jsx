import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  getAdminStats,
  startSession,
  endSession,
  publishResults,
  resetAllData,
} from "../../services/adminService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [phase, setPhase] = useState(
    sessionStorage.getItem("adminPhase") || "idle",
  );

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const isMainAdmin = admin?.role === "mainAdmin";

  useEffect(() => {
    if (!admin) {
      navigate("/admin-login");
      return;
    }
    loadStats();
  }, []);

  useEffect(() => {
    let interval;
    if (phase === "voting") interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  const loadStats = async () => {
    try {
      const result = await getAdminStats(phase);
      if (result.success) setStats(result.stats);
    } catch (err) {
      console.error("Stats error:", err);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage(""), 5000);
  };

  const handleStartSession = async () => {
    const result = await startSession();
    if (result.success) {
      setPhase("voting");
      sessionStorage.setItem("adminPhase", "voting");
      sessionStorage.setItem("sessionStatus", "active");
      showMessage("Voting session started!", "success");
      loadStats();
    } else showMessage(result.message || "Failed to start session", "error");
  };

  const handleEndSession = async () => {
    const result = await endSession();
    if (result.success) {
      setPhase("counting");
      sessionStorage.setItem("adminPhase", "counting");
      sessionStorage.setItem("sessionStatus", "ended");
      showMessage("Session ended. Counting in progress.", "success");
      loadStats();
    } else showMessage(result.message || "Failed to end session", "error");
  };

  const handlePublishResults = async () => {
    const result = await publishResults();
    if (result.success) {
      setPhase("published");
      sessionStorage.setItem("adminPhase", "published");
      sessionStorage.setItem("resultsPublished", "true");
      showMessage("Results published!", "success");
      setTimeout(() => navigate("/winner"), 1500);
    } else showMessage(result.message || "Failed to publish results", "error");
  };

  const handleResetData = async () => {
    const confirm = window.confirm(
      "Reset ALL election data? This cannot be undone!",
    );
    if (!confirm) return;
    const result = await resetAllData();
    if (result.success) {
      setPhase("idle");
      sessionStorage.removeItem("adminPhase");
      sessionStorage.removeItem("electionId");
      showMessage("All data reset successfully!", "success");
      loadStats();
    } else showMessage(result.message || "Failed to reset data", "error");
  };

  const phaseConfig = {
    idle: {
      label: "Idle",
      cls: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    },
    voting: {
      label: "Voting Open",
      cls: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    counting: {
      label: "Counting",
      cls: "bg-blue-100 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    published: {
      label: "Published",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
  };

  const navCards = [
    {
      label: "Manage Elections",
      icon: "🗳️",
      path: "/admin/elections",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "Manage Candidates",
      icon: "👥",
      path: "/admin/candidates",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "Add Student",
      icon: "➕",
      path: "/admin/students/add",
      enabled: true,
      mainAdminOnly: true,
    },
    {
      label: "Student List",
      icon: "📋",
      path: "/admin/students/list",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "Session Control",
      icon: "⚙️",
      path: "/admin/session-control",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "System Settings",
      icon: "🔧",
      path: "/admin/settings",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "View Results",
      icon: "📊",
      path: "/results",
      enabled: phase === "counting" || phase === "published",
      mainAdminOnly: false,
    },
    {
      label: "View Winner",
      icon: "🏆",
      path: "/winner",
      enabled: phase === "published",
      mainAdminOnly: false,
    },
    {
      label: "Audit Logs",
      icon: "🛡️",
      path: "/admin/audit-logs",
      enabled: true,
      mainAdminOnly: false,
    },
    {
      label: "Create Admin Account",
      icon: "🔐",
      path: "/admin/create-admin",
      enabled: true,
      mainAdminOnly: true,
    },
  ];

  const visibleCards = navCards.filter((c) => !c.mainAdminOnly || isMainAdmin);
  const phaseCfg = phaseConfig[phase] || phaseConfig.idle;

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
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                   text-[0.6rem] font-black tracking-widest uppercase border
                                   ${
                                     isMainAdmin
                                       ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                                       : "bg-blue-400/20 text-blue-300 border-blue-400/30"
                                   }`}
                  >
                    {isMainAdmin ? "⭐ Main Admin" : "👤 Election Officer"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                   text-[0.6rem] font-black tracking-widest uppercase border
                                   ${phaseCfg.cls}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${phaseCfg.dot}
                                     ${phase === "voting" ? "animate-pulse" : ""}`}
                    />
                    {phaseCfg.label}
                  </span>
                </div>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Admin Dashboard
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Welcome back,{" "}
                  <span className="text-white/80 font-semibold">
                    {admin?.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/");
                }}
                className="shrink-0 mt-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30
                           text-red-300 text-xs font-bold tracking-widest uppercase
                           hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8">
            {/* ── Message ── */}
            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                               font-semibold mb-5 border
                               ${
                                 messageType === "success"
                                   ? "bg-green-50 border-green-200 text-green-700"
                                   : "bg-red-50 border-red-200 text-red-700"
                               }`}
              >
                <span>{messageType === "success" ? "✅" : "⚠️"}</span>
                <span>{message}</span>
              </div>
            )}

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
                  Loading dashboard...
                </p>
              </div>
            )}

            {!loading && (
              <>
                {/* ── Stats grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
                  {[
                    {
                      label: "Students",
                      value: stats?.totalStudents ?? 0,
                      icon: "🎓",
                      cls: "bg-gray-50 border-gray-100 text-gray-700",
                    },
                    {
                      label: "Votes Cast",
                      value: stats?.totalVotes ?? 0,
                      icon: "🗳️",
                      cls: "bg-green-50 border-green-100 text-green-700",
                    },
                    {
                      label: "Elections",
                      value: stats?.totalElections ?? 0,
                      icon: "📋",
                      cls: "bg-blue-50 border-blue-100 text-blue-700",
                    },
                    {
                      label: "Active",
                      value: stats?.activeElections ?? 0,
                      icon: "⚡",
                      cls: "bg-amber-50 border-amber-100 text-amber-700",
                    },
                  ].map(({ label, value, icon, cls }) => (
                    <div
                      key={label}
                      className={`rounded-xl border px-3 py-3.5 text-center ${cls}`}
                    >
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-2xl font-black leading-none">
                        {value}
                      </div>
                      <div className="text-[0.6rem] font-bold tracking-widest uppercase mt-1 opacity-60">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Session control strip ── */}
                {isMainAdmin && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-7">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs font-black text-[#1a3a1a] tracking-wide">
                          Session Control
                        </p>
                        <p className="text-[0.65rem] text-gray-400 mt-0.5">
                          Current phase:{" "}
                          <span className="font-bold text-[#2d6a2d]">
                            {phaseCfg.label}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {phase === "idle" && (
                          <button
                            onClick={handleStartSession}
                            className="px-4 py-2 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                                       text-white text-xs font-black tracking-widest uppercase
                                       cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            ▶️ Start Voting
                          </button>
                        )}
                        {phase === "voting" && (
                          <button
                            onClick={handleEndSession}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700
                                       text-white text-xs font-black tracking-widest uppercase
                                       cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            ⏹️ End Session
                          </button>
                        )}
                        {phase === "counting" && (
                          <button
                            onClick={handlePublishResults}
                            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600
                                       text-white text-xs font-black tracking-widest uppercase
                                       cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            📢 Publish Results
                          </button>
                        )}
                        {isMainAdmin && (
                          <button
                            onClick={handleResetData}
                            className="px-4 py-2 rounded-lg border border-red-200
                                       text-red-500 text-xs font-black tracking-widest uppercase
                                       hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            🔄 Reset All
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Navigation grid ── */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-black text-[#1a3a1a] tracking-widest uppercase whitespace-nowrap">
                    Quick Navigation
                  </p>
                  <hr className="flex-1 border-gray-100" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
                  {visibleCards.map((card) => (
                    <button
                      key={card.path}
                      onClick={() => navigate(card.path)}
                      disabled={!card.enabled}
                      className={`flex flex-col items-center gap-2 rounded-xl border
                                  px-3 py-4 text-center transition-all duration-150
                                  ${
                                    card.enabled
                                      ? "bg-gray-50 border-gray-100 hover:bg-white hover:border-[#2d6a2d]/30 hover:shadow-sm cursor-pointer"
                                      : "bg-gray-50/50 border-gray-100 opacity-40 cursor-not-allowed"
                                  }`}
                    >
                      <span className="text-2xl">{card.icon}</span>
                      <span
                        className="text-[0.7rem] font-black text-[#1a3a1a] tracking-wide
                                       leading-tight text-center"
                      >
                        {card.label}
                      </span>
                      {!card.enabled && (
                        <span className="text-[0.55rem] text-gray-300 font-bold tracking-widest uppercase">
                          Locked
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {phase === "idle" && (
                  <p className="text-center text-xs text-gray-300 mt-1">
                    🔒 Results & Winner pages unlock after the session ends
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
