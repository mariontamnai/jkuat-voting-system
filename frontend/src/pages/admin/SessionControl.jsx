import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  startSession,
  endSession,
  publishResults,
} from "../../services/adminService";

const SessionControl = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [phase, setPhase] = useState(
    sessionStorage.getItem("adminPhase") || "idle",
  );
  const [loadingAction, setLoadingAction] = useState(null);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage(""), 5000);
  };

  const handleStartSession = async () => {
    setLoadingAction("start");
    const result = await startSession();
    if (result.success) {
      setPhase("voting");
      sessionStorage.setItem("adminPhase", "voting");
      sessionStorage.setItem("sessionStatus", "active");
      showMessage("Voting session started successfully!", "success");
    } else showMessage(result.message || "Failed to start session", "error");
    setLoadingAction(null);
  };

  const handleEndSession = async () => {
    setLoadingAction("end");
    const result = await endSession();
    if (result.success) {
      setPhase("counting");
      sessionStorage.setItem("adminPhase", "counting");
      sessionStorage.setItem("sessionStatus", "ended");
      showMessage("Session ended. Vote counting in progress.", "success");
    } else showMessage(result.message || "Failed to end session", "error");
    setLoadingAction(null);
  };

  const handlePublishResults = async () => {
    setLoadingAction("publish");
    const result = await publishResults();
    if (result.success) {
      setPhase("published");
      sessionStorage.setItem("adminPhase", "published");
      sessionStorage.setItem("resultsPublished", "true");
      showMessage(
        "Results published! Redirecting to winner page...",
        "success",
      );
      setTimeout(() => navigate("/winner"), 1500);
    } else showMessage(result.message || "Failed to publish results", "error");
    setLoadingAction(null);
  };

  const phaseConfig = {
    idle: {
      label: "Idle",
      cls: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
      pulse: false,
      step: 0,
    },
    voting: {
      label: "Voting Open",
      cls: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
      pulse: true,
      step: 1,
    },
    counting: {
      label: "Counting",
      cls: "bg-blue-100 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      pulse: false,
      step: 2,
    },
    published: {
      label: "Published",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      pulse: false,
      step: 3,
    },
  };

  const steps = [
    {
      key: "idle",
      number: 1,
      icon: "⚙️",
      label: "Setup",
      desc: "Configure election, add candidates and students before opening voting.",
      action: null,
    },
    {
      key: "voting",
      number: 2,
      icon: "🗳️",
      label: "Voting Open",
      desc: "Students can now cast their votes. Monitor participation in real time.",
      action: {
        label: "Start Voting Session",
        handler: handleStartSession,
        loading: loadingAction === "start",
        enabled: phase === "idle",
        cls: "bg-[#1a3a1a] hover:bg-[#152e15] text-white",
      },
    },
    {
      key: "counting",
      number: 3,
      icon: "📊",
      label: "Counting Votes",
      desc: "Voting is closed. Verify results before publishing to all users.",
      action: {
        label: "End Voting Session",
        handler: handleEndSession,
        loading: loadingAction === "end",
        enabled: phase === "voting",
        cls: "bg-red-600 hover:bg-red-700 text-white",
      },
    },
    {
      key: "published",
      number: 4,
      icon: "🏆",
      label: "Results Published",
      desc: "Official results are live. Winners are announced to all participants.",
      action: {
        label: "Publish Results",
        handler: handlePublishResults,
        loading: loadingAction === "publish",
        enabled: phase === "counting",
        cls: "bg-amber-500 hover:bg-amber-600 text-white",
      },
    },
  ];

  const phaseCfg = phaseConfig[phase] || phaseConfig.idle;
  const currentStep = phaseCfg.step;

  const Spinner = () => (
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
  );

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
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  ⚙️ Admin Panel
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Session Control
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Manage the voting lifecycle step by step
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

            {/* ── Current phase banner ── */}
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 mb-7 ${phaseCfg.cls}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${phaseCfg.dot}
                                  ${phaseCfg.pulse ? "animate-pulse" : ""}`}
                />
                <div>
                  <p className="text-xs font-black tracking-wide">
                    Current Phase
                  </p>
                  <p className="text-base font-black tracking-tight leading-tight">
                    {phaseCfg.label}
                  </p>
                </div>
              </div>
              <span className="text-2xl">{steps[currentStep]?.icon}</span>
            </div>

            {/* ── Steps timeline ── */}
            <div className="flex flex-col gap-0">
              {steps.map((step, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isFuture = idx > currentStep;
                const isLast = idx === steps.length - 1;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Left: connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center
                                       text-sm font-black shrink-0 border-2 transition-all
                                       ${
                                         isDone
                                           ? "bg-[#2d6a2d] border-[#2d6a2d] text-white"
                                           : isCurrent
                                             ? "bg-white border-[#2d6a2d] text-[#2d6a2d]"
                                             : "bg-gray-100 border-gray-200 text-gray-300"
                                       }`}
                      >
                        {isDone ? "✓" : step.number}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 my-1 rounded-full transition-all
                                         ${idx < currentStep ? "bg-[#2d6a2d]" : "bg-gray-200"}`}
                          style={{ minHeight: "24px" }}
                        />
                      )}
                    </div>

                    {/* Right: content */}
                    <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                      <div
                        className={`rounded-xl border px-4 py-4 transition-all duration-200
                                       ${
                                         isCurrent
                                           ? "bg-green-50 border-green-200 shadow-sm"
                                           : isDone
                                             ? "bg-gray-50 border-gray-100"
                                             : "bg-gray-50/50 border-gray-100 opacity-60"
                                       }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{step.icon}</span>
                            <p
                              className={`text-sm font-black tracking-tight
                                          ${isCurrent ? "text-[#1a3a1a]" : isDone ? "text-gray-500" : "text-gray-300"}`}
                            >
                              {step.label}
                            </p>
                          </div>
                          {isDone && (
                            <span
                              className="text-[0.6rem] font-black text-green-600
                                             bg-green-100 border border-green-200
                                             px-2 py-0.5 rounded-full tracking-widest uppercase"
                            >
                              Done
                            </span>
                          )}
                          {isCurrent && (
                            <span
                              className={`text-[0.6rem] font-black px-2 py-0.5 rounded-full
                                             tracking-widest uppercase border
                                             ${phaseCfg.cls}`}
                            >
                              Current
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-xs leading-relaxed mb-3
                                       ${isCurrent ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {step.desc}
                        </p>

                        {/* Action button — only show on the NEXT step to take */}
                        {step.action && idx === currentStep + 1 && (
                          <button
                            onClick={step.action.handler}
                            disabled={
                              !step.action.enabled || step.action.loading
                            }
                            className={`px-4 py-2.5 rounded-lg text-xs font-black
                                        tracking-widest uppercase cursor-pointer
                                        transition-colors duration-150
                                        flex items-center gap-2
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        ${step.action.cls}`}
                          >
                            {step.action.loading ? (
                              <>
                                <Spinner /> Processing...
                              </>
                            ) : (
                              step.action.label
                            )}
                          </button>
                        )}

                        {/* Current step action */}
                        {step.action && isCurrent && step.action.enabled && (
                          <button
                            onClick={step.action.handler}
                            disabled={step.action.loading}
                            className={`px-4 py-2.5 rounded-lg text-xs font-black
                                        tracking-widest uppercase cursor-pointer
                                        transition-colors duration-150
                                        flex items-center gap-2
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        ${step.action.cls}`}
                          >
                            {step.action.loading ? (
                              <>
                                <Spinner /> Processing...
                              </>
                            ) : (
                              step.action.label
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Published state shortcut ── */}
            {phase === "published" && (
              <button
                onClick={() => navigate("/winner")}
                className="w-full mt-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-600
                           text-white text-xs font-black tracking-widest uppercase
                           cursor-pointer transition-colors duration-150
                           flex items-center justify-center gap-2"
              >
                🏆 View Winner Announcement
              </button>
            )}

            <p
              className="flex items-center justify-center gap-1.5 mt-6
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 All session actions are logged in audit trail
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SessionControl;
