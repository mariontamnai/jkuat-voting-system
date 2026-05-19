import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const AuditLogs = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  if (!admin || admin.role !== "mainAdmin") navigate("/admin/dashboard");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/audit-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError("Failed to load audit logs");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    SUCCESS: {
      pill: "bg-green-100 text-green-700 border border-green-200",
      border: "border-l-green-500",
      stat: "bg-green-50 border border-green-100 text-green-700",
    },
    FAILURE: {
      pill: "bg-red-100 text-red-700 border border-red-200",
      border: "border-l-red-500",
      stat: "bg-red-50 border border-red-100 text-red-700",
    },
    INFO: {
      pill: "bg-blue-100 text-blue-700 border border-blue-200",
      border: "border-l-blue-400",
      stat: "bg-blue-50 border border-blue-100 text-blue-700",
    },
  };

  const getActionIcon = (action = "") => {
    if (action.includes("LOGIN")) return "🔐";
    if (action.includes("REGISTER") || action.includes("CREATE")) return "➕";
    if (action.includes("DELETE")) return "🗑️";
    if (action.includes("UPDATE")) return "✏️";
    if (action.includes("VOTE")) return "🗳️";
    if (action.includes("ELECTION")) return "📋";
    if (action.includes("FACE") || action.includes("BIOMETRIC")) return "👤";
    if (action.includes("PASSWORD")) return "🔑";
    if (action.includes("RESET")) return "⚠️";
    return "📝";
  };

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "ALL" || log.status === filter;
    const matchesSearch =
      search === "" ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.includes(search) ||
      log.userModel?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  🛡️ Admin · Main Admin Only
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Audit Logs
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  System activity history · {logs.length} total events
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Success", key: "SUCCESS", icon: "✅" },
                { label: "Failure", key: "FAILURE", icon: "❌" },
                { label: "Info", key: "INFO", icon: "ℹ️" },
                { label: "Total", key: null, icon: "📋" },
              ].map(({ label, key, icon }) => {
                const count = key
                  ? logs.filter((l) => l.status === key).length
                  : logs.length;
                const cfg = key ? statusConfig[key] : null;
                return (
                  <button
                    key={label}
                    onClick={() =>
                      key && setFilter(filter === key ? "ALL" : key)
                    }
                    className={`rounded-xl px-3 py-3.5 text-center border transition-all duration-150
                                ${cfg ? cfg.stat : "bg-gray-50 border-gray-100 text-gray-700"}
                                ${filter === key ? "ring-2 ring-offset-1 ring-[#2d6a2d]" : ""}
                                ${key ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                  >
                    <div className="text-lg mb-0.5">{icon}</div>
                    <div className="text-xl font-black leading-none">
                      {count}
                    </div>
                    <div className="text-[0.6rem] font-bold tracking-widest uppercase mt-1 opacity-70">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Search & filter bar ── */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search action, IP, or user type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200
                             text-sm outline-none placeholder-gray-300
                             focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                             transition-all duration-150"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ backgroundColor: "white", color: "#1a3a1a" }}
                className="py-2.5 px-4 rounded-lg border border-gray-200 text-sm
                           outline-none focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                           cursor-pointer transition-all duration-150"
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="INFO">Info</option>
              </select>

              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                           text-white text-xs font-black tracking-widest uppercase
                           cursor-pointer transition-colors duration-150
                           flex items-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5"
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
                    Loading...
                  </>
                ) : (
                  "🔄 Refresh"
                )}
              </button>
            </div>

            {/* Results count */}
            {!loading && !error && (
              <p className="text-xs text-gray-400 mb-4">
                Showing{" "}
                <span className="font-bold text-[#1a3a1a]">
                  {filteredLogs.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#1a3a1a]">{logs.length}</span>{" "}
                events
                {filter !== "ALL" && (
                  <button
                    onClick={() => {
                      setFilter("ALL");
                      setSearch("");
                    }}
                    className="ml-2 text-[#2d6a2d] font-bold hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </p>
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
                  Loading audit logs...
                </p>
              </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
              <div
                className="flex items-center justify-between gap-4 bg-red-50
                              border border-red-200 rounded-xl px-4 py-3.5 mb-4"
              >
                <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700
                             text-white text-xs font-bold cursor-pointer
                             transition-colors duration-150"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && !error && filteredLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-bold text-gray-400">
                  No logs match your criteria
                </p>
                <button
                  onClick={() => {
                    setFilter("ALL");
                    setSearch("");
                  }}
                  className="mt-1 text-xs text-[#2d6a2d] font-bold hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* ── Log entries ── */}
            {!loading && !error && filteredLogs.length > 0 && (
              <div className="flex flex-col gap-2">
                {filteredLogs.map((log, index) => {
                  const cfg = statusConfig[log.status] || {
                    pill: "bg-gray-100 text-gray-600 border border-gray-200",
                    border: "border-l-gray-300",
                  };
                  return (
                    <div
                      key={log._id || index}
                      className={`rounded-xl bg-gray-50 border border-gray-100
                                  border-l-4 ${cfg.border}
                                  px-4 py-3.5 transition-all duration-150
                                  hover:bg-white hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        {/* Left: icon + action */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg bg-white border border-gray-100
                                          flex items-center justify-center text-base shrink-0 mt-0.5"
                          >
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1a3a1a] leading-tight">
                              {log.action?.replace(/_/g, " ") ||
                                "Unknown Action"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                              <span>{log.userModel || "System"}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="font-mono">
                                IP: {log.ipAddress || "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Right: status pill + timestamp */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full
                                           text-[0.6rem] font-black tracking-widest uppercase
                                           mb-1 ${cfg.pill}`}
                          >
                            {log.status}
                          </span>
                          <p className="text-[0.65rem] text-gray-400 font-mono">
                            {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Details block */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div
                          className="mt-3 bg-white border border-gray-100 rounded-lg
                                        px-3 py-2.5 text-xs text-gray-500 font-mono
                                        overflow-x-auto whitespace-pre-wrap"
                        >
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
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

export default AuditLogs;
