import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getElections } from "../../services/adminService";

const Elections = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const admin = JSON.parse(sessionStorage.getItem("admin"));

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
    if (result.success) setElections(result.elections);
    setLoading(false);
  };

  const statusConfig = {
    active: {
      pill: "bg-green-100 text-green-700 border border-green-200",
      dot: "bg-green-500",
      pulse: true,
    },
    completed: {
      pill: "bg-blue-100 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
      pulse: false,
    },
    draft: {
      pill: "bg-amber-100 text-amber-700 border border-amber-200",
      dot: "bg-amber-400",
      pulse: false,
    },
    pending: {
      pill: "bg-gray-100 text-gray-500 border border-gray-200",
      dot: "bg-gray-400",
      pulse: false,
    },
  };

  const statusCounts = {
    active: elections.filter((e) => e.status === "active").length,
    completed: elections.filter((e) => e.status === "completed").length,
    draft: elections.filter((e) => e.status === "draft").length,
  };

  const formatDate = (val) => {
    if (!val) return null;
    return new Date(val).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  All Elections
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  {elections.length} election{elections.length !== 1 ? "s" : ""}{" "}
                  registered
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

          <div className="px-6 py-7 md:px-8">
            {/* ── Stats row ── */}
            {!loading && elections.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {
                    label: "Active",
                    value: statusCounts.active,
                    icon: "⚡",
                    cls: "bg-green-50 border-green-100 text-green-700",
                  },
                  {
                    label: "Completed",
                    value: statusCounts.completed,
                    icon: "✅",
                    cls: "bg-blue-50 border-blue-100 text-blue-700",
                  },
                  {
                    label: "Draft",
                    value: statusCounts.draft,
                    icon: "📝",
                    cls: "bg-amber-50 border-amber-100 text-amber-700",
                  },
                ].map(({ label, value, icon, cls }) => (
                  <div
                    key={label}
                    className={`rounded-xl border px-3 py-3 text-center ${cls}`}
                  >
                    <div className="text-lg mb-0.5">{icon}</div>
                    <div className="text-xl font-black leading-none">
                      {value}
                    </div>
                    <div className="text-[0.6rem] font-bold tracking-widest uppercase mt-1 opacity-70">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Create button ── */}
            <button
              onClick={() => navigate("/admin/elections/create")}
              className="w-full py-3.5 rounded-xl bg-[#1a3a1a] hover:bg-[#152e15]
                         text-white text-xs font-black tracking-widest uppercase
                         cursor-pointer transition-colors duration-150
                         flex items-center justify-center gap-2 mb-6"
            >
              ➕ Create New Election
            </button>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Elections
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

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
                  Loading elections...
                </p>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && elections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <span className="text-4xl">🗳️</span>
                <p className="text-sm font-bold text-gray-400">
                  No elections created yet
                </p>
                <p className="text-xs text-gray-300">
                  Click "Create New Election" to get started
                </p>
              </div>
            )}

            {/* ── Elections list ── */}
            {!loading && elections.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {elections.map((election) => {
                  const cfg =
                    statusConfig[election.status] || statusConfig.pending;
                  return (
                    <div
                      key={election.id}
                      className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4
                                 hover:bg-white hover:shadow-sm transition-all duration-150"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: icon + info */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl bg-[#2d6a2d]/10
                                          border border-[#2d6a2d]/15
                                          flex items-center justify-center text-lg shrink-0"
                          >
                            🗳️
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#1a3a1a] leading-tight">
                              {election.title}
                            </p>
                            {election.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {election.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {election.startDate && (
                                <span
                                  className="text-[0.6rem] font-bold text-gray-400
                                                 bg-gray-100 px-2 py-0.5 rounded-full"
                                >
                                  📅 {formatDate(election.startDate)}
                                </span>
                              )}
                              {election.endDate && (
                                <span
                                  className="text-[0.6rem] font-bold text-gray-400
                                                 bg-gray-100 px-2 py-0.5 rounded-full"
                                >
                                  🏁 {formatDate(election.endDate)}
                                </span>
                              )}
                            </div>
                            <p className="text-[0.6rem] font-mono text-gray-300 mt-1.5">
                              ID: {election.id}
                            </p>
                          </div>
                        </div>

                        {/* Right: status pill */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                          rounded-full text-[0.6rem] font-black
                                          tracking-widest uppercase shrink-0 ${cfg.pill}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}
                                           ${cfg.pulse ? "animate-pulse" : ""}`}
                          />
                          {election.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Elections;
