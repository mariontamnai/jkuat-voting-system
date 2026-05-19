import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { resetAllData } from "../../services/adminService";

const Settings = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  if (!admin || admin.role !== "mainAdmin") {
    navigate("/admin/dashboard");
    return null;
  }

  const phase = sessionStorage.getItem("adminPhase") || "idle";
  const isVoting = phase === "voting";

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage(""), 5000);
  };

  const handleResetData = async () => {
    setResetLoading(true);
    const result = await resetAllData();
    if (result.success) {
      sessionStorage.removeItem("adminPhase");
      sessionStorage.removeItem("electionId");
      showMessage("All data reset successfully!", "success");
      setConfirmReset(false);
    } else {
      showMessage(result.message || "Failed to reset data", "error");
    }
    setResetLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
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
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300
                                 border border-amber-400/30 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  ⭐ Main Admin Only
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  System Settings
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Administrative and system-level actions
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

            {/* ── Session info strip ── */}
            <div
              className="flex items-center justify-between bg-gray-50 border border-gray-100
                            rounded-xl px-4 py-3 mb-7"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <div>
                  <p className="text-xs font-black text-[#1a3a1a]">
                    Current Phase
                  </p>
                  <p className="text-[0.65rem] text-gray-400 mt-0.5 capitalize">
                    {phase}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               text-[0.6rem] font-black tracking-widest uppercase border
                               ${
                                 isVoting
                                   ? "bg-green-100 text-green-700 border-green-200"
                                   : "bg-gray-100 text-gray-500 border-gray-200"
                               }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full
                                  ${isVoting ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
                {isVoting ? "Live" : phase}
              </span>
            </div>

            {/* ── Account section ── */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-black text-[#1a3a1a] tracking-widest uppercase whitespace-nowrap">
                  Account
                </p>
                <hr className="flex-1 border-gray-100" />
              </div>

              <div
                className="flex items-center justify-between bg-gray-50 border border-gray-100
                              rounded-xl px-4 py-3.5 mb-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl bg-[#2d6a2d]/10 border border-[#2d6a2d]/15
                                  flex items-center justify-center text-base"
                  >
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1a3a1a]">
                      {admin?.name}
                    </p>
                    <p className="text-[0.6rem] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
                      {admin?.role === "mainAdmin"
                        ? "⭐ Main Admin"
                        : "👤 Election Officer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-500
                             text-xs font-black tracking-widest uppercase
                             hover:bg-red-50 hover:border-red-300
                             transition-colors duration-150 cursor-pointer"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            {/* ── Danger zone ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-black text-red-500 tracking-widest uppercase whitespace-nowrap">
                  ⚠️ Danger Zone
                </p>
                <hr className="flex-1 border-red-100" />
              </div>

              {/* Voting lock warning */}
              {isVoting && (
                <div
                  className="flex items-start gap-3 bg-amber-50 border border-amber-200
                                rounded-xl px-4 py-3.5 mb-4"
                >
                  <span className="text-lg mt-0.5">🔒</span>
                  <div>
                    <p className="text-xs font-black text-amber-700 mb-0.5">
                      Reset Locked
                    </p>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      Data cannot be reset while a voting session is active. End
                      the session first.
                    </p>
                  </div>
                </div>
              )}

              {/* Reset card */}
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">🗑️</span>
                  <div>
                    <p className="text-sm font-black text-red-700">
                      Reset All Election Data
                    </p>
                    <p className="text-xs text-red-500 mt-1 leading-relaxed">
                      Permanently deletes all votes, candidates, elections, and
                      resets student voting status.{" "}
                      <span className="font-black">This cannot be undone.</span>
                    </p>
                  </div>
                </div>

                {/* Inline confirm flow */}
                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    disabled={isVoting}
                    className="w-full py-2.5 rounded-lg border-2 border-red-300
                               text-red-600 text-xs font-black tracking-widest uppercase
                               hover:bg-red-100 hover:border-red-400
                               transition-colors duration-150 cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🗑️ Reset All Data
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-red-700 text-center mb-3">
                      Are you absolutely sure? This action is irreversible.
                    </p>
                    <button
                      onClick={handleResetData}
                      disabled={resetLoading}
                      className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700
                                 text-white text-xs font-black tracking-widest uppercase
                                 transition-colors duration-150 cursor-pointer
                                 flex items-center justify-center gap-2
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? (
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
                          Resetting...
                        </>
                      ) : (
                        "⚠️ Yes, Reset Everything"
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="w-full py-2.5 rounded-lg border border-gray-200
                                 text-gray-500 text-xs font-black tracking-widest uppercase
                                 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p
              className="flex items-center justify-center gap-1.5 mt-7
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 All actions are logged in the audit trail
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
