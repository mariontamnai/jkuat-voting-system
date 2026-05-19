import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createElection } from "../../services/adminService";

const inputClass = `
  w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none
  placeholder-gray-300 focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
  transition-all duration-150
`;

const CreateElection = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const set = (field) => (e) =>
    setNewElection((prev) => ({ ...prev, [field]: e.target.value }));

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleCreateElection = async () => {
    setLoading(true);
    const result = await createElection(newElection);
    if (result.success) {
      showMessage("Election created successfully!", "success");
      setTimeout(() => navigate("/admin/elections"), 1500);
    } else {
      showMessage(result.message || "Failed to create election", "error");
    }
    setLoading(false);
  };

  const isValid =
    newElection.title.trim() && newElection.startDate && newElection.endDate;

  const formatPreviewDate = (val) => {
    if (!val) return null;
    return new Date(val).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const durationDays = () => {
    if (!newElection.startDate || !newElection.endDate) return null;
    const diff =
      new Date(newElection.endDate) - new Date(newElection.startDate);
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h duration`;
    return `${hours}h duration`;
  };

  const dateError =
    newElection.startDate &&
    newElection.endDate &&
    new Date(newElection.endDate) <= new Date(newElection.startDate);

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
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  👤 Admin Panel
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Create Election
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Set up a new election with dates and details
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/elections")}
                className="shrink-0 mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                           text-white text-xs font-bold tracking-widest uppercase
                           hover:bg-white/20 transition-colors cursor-pointer"
              >
                ← Back
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

            {/* ── Live preview card ── */}
            <div
              className={`rounded-xl border px-4 py-3.5 mb-6 transition-all duration-200
                             ${
                               newElection.title
                                 ? "bg-green-50 border-green-200"
                                 : "bg-gray-50 border-gray-100"
                             }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center
                                 text-xl shrink-0 transition-all duration-200
                                 ${
                                   newElection.title
                                     ? "bg-[#2d6a2d]/15 border border-[#2d6a2d]/20"
                                     : "bg-gray-200"
                                 }`}
                >
                  🗳️
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-black truncate transition-colors
                                 ${newElection.title ? "text-[#1a3a1a]" : "text-gray-300"}`}
                  >
                    {newElection.title || "Election Title"}
                  </p>
                  {newElection.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {newElection.description}
                    </p>
                  )}
                  {(newElection.startDate || newElection.endDate) && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {newElection.startDate && (
                        <span
                          className="text-[0.6rem] font-bold text-[#2d6a2d] bg-green-100
                                         px-2 py-0.5 rounded-full"
                        >
                          From: {formatPreviewDate(newElection.startDate)}
                        </span>
                      )}
                      {newElection.endDate && (
                        <span
                          className="text-[0.6rem] font-bold text-gray-500 bg-gray-100
                                         px-2 py-0.5 rounded-full"
                        >
                          To: {formatPreviewDate(newElection.endDate)}
                        </span>
                      )}
                      {durationDays() && (
                        <span
                          className="text-[0.6rem] font-bold text-amber-600 bg-amber-50
                                         px-2 py-0.5 rounded-full"
                        >
                          ⏱ {durationDays()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span
                  className="text-[0.6rem] font-black tracking-widest uppercase
                                 text-gray-300 shrink-0"
                >
                  Preview
                </span>
              </div>
            </div>

            {/* ── Form ── */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label
                  className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                  tracking-widest uppercase mb-2"
                >
                  Election Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JKUSA Student Leaders Election 2026"
                  value={newElection.title}
                  onChange={set("title")}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                  tracking-widest uppercase mb-2"
                >
                  Description{" "}
                  <span className="text-gray-300 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this election..."
                  value={newElection.description}
                  onChange={set("description")}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                    tracking-widest uppercase mb-2"
                  >
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newElection.startDate}
                    onChange={set("startDate")}
                    style={{ backgroundColor: "white", color: "#1a3a1a" }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                    tracking-widest uppercase mb-2"
                  >
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newElection.endDate}
                    onChange={set("endDate")}
                    style={{ backgroundColor: "white", color: "#1a3a1a" }}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Date validation error */}
              {dateError && (
                <div
                  className="flex items-center gap-2 bg-red-50 border border-red-200
                                rounded-lg px-3 py-2.5 -mt-2"
                >
                  <span className="text-sm">⚠️</span>
                  <p className="text-xs text-red-600 font-semibold">
                    End date must be after the start date
                  </p>
                </div>
              )}

              {/* Duration chip */}
              {durationDays() && !dateError && (
                <div
                  className="flex items-center gap-2 bg-amber-50 border border-amber-200
                                rounded-lg px-3 py-2.5 -mt-2"
                >
                  <span className="text-sm">⏱️</span>
                  <p className="text-xs text-amber-700 font-semibold">
                    Election duration:{" "}
                    <span className="font-black">{durationDays()}</span>
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-300 mt-4 mb-6">
              <span className="text-red-400">*</span> Required fields
            </p>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Confirm
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Buttons ── */}
            <button
              onClick={handleCreateElection}
              disabled={!isValid || !!dateError || loading}
              className="w-full py-3.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                         text-white text-xs font-black tracking-widest uppercase
                         cursor-pointer transition-colors duration-150
                         flex items-center justify-center gap-2
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
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
                  Creating...
                </>
              ) : (
                "🗳️ Save Election"
              )}
            </button>

            <button
              onClick={() => navigate("/admin/elections")}
              className="w-full mt-3 py-3.5 rounded-lg border border-[#2d6a2d]/25
                         text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                         hover:bg-green-50 hover:border-[#2d6a2d]/50
                         transition-colors duration-150 cursor-pointer"
            >
              ← Back to Elections
            </button>

            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Election details are saved securely
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateElection;
