import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  getElections,
  getCandidates,
  updateCandidate,
  deleteCandidate,
} from "../../services/adminService";

const inputClass = `
  w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none
  placeholder-gray-300 focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
  transition-all duration-150
`;

const CandidatesList = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(
    sessionStorage.getItem("electionId") || "",
  );
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [electionsLoading, setElectionsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editCandidateForm, setEditCandidateForm] = useState({
    name: "",
    position: "",
    party: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const phase = sessionStorage.getItem("adminPhase") || "idle";
  const isLocked = phase !== "idle";

  useEffect(() => {
    if (!admin) {
      navigate("/admin-login");
      return;
    }

    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElection) loadCandidates(selectedElection);
  }, [selectedElection]);

  const loadElections = async () => {
    setElectionsLoading(true);
    const result = await getElections();
    if (result.success) {
      setElections(result.elections);
      const savedId = sessionStorage.getItem("electionId");
      if (savedId) setSelectedElection(savedId);
    }
    setElectionsLoading(false);
  };

  const loadCandidates = async (electionId) => {
    setLoading(true);
    const result = await getCandidates(electionId);
    if (result.success) setCandidates(result.candidates);
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSaveCandidate = async (candidateId) => {
    const result = await updateCandidate(
      selectedElection,
      candidateId,
      editCandidateForm,
    );
    if (result.success) {
      showMessage("Candidate updated successfully!", "success");
      setEditingCandidate(null);
      loadCandidates(selectedElection);
    } else {
      showMessage(result.message || "Failed to update candidate", "error");
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    const result = await deleteCandidate(selectedElection, candidateId);
    if (result.success) {
      showMessage("Candidate deleted successfully!", "success");
      setShowDeleteConfirm(null);
      loadCandidates(selectedElection);
    } else {
      showMessage(result.message || "Failed to delete candidate", "error");
    }
  };

  const groupedCandidates = candidates.reduce((acc, candidate) => {
    const pos = candidate.position || "Unknown";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(candidate);
    return acc;
  }, {});

  const selectedElectionData = elections.find((e) => e.id === selectedElection);

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
                  👤 Admin Panel
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Candidates List
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  {candidates.length > 0
                    ? `${candidates.length} candidates across ${Object.keys(groupedCandidates).length} positions`
                    : "Manage candidates per election"}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/candidates")}
                className="shrink-0 mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                           text-white text-xs font-bold tracking-widest uppercase
                           hover:bg-white/20 transition-colors cursor-pointer"
              >
                ← Back
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

            {/* ── Election selector ── */}
            <div className="mb-6">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                Select Election
              </label>
              {electionsLoading ? (
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
                  onChange={(e) => {
                    setSelectedElection(e.target.value);
                    sessionStorage.setItem("electionId", e.target.value);
                  }}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                             outline-none focus:border-[#2d6a2d] focus:ring-2
                             focus:ring-[#2d6a2d]/15 cursor-pointer transition-all duration-150"
                >
                  <option value="">— Select an election —</option>
                  {elections.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.year})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Selected election chip ── */}
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
                      {candidates.length} candidate
                      {candidates.length !== 1 ? "s" : ""} registered
                    </p>
                  </div>
                </div>
                {isLocked && (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                   bg-amber-100 text-amber-700 border border-amber-200
                                   text-[0.6rem] font-black tracking-widest uppercase"
                  >
                    🔒 Locked
                  </span>
                )}
              </div>
            )}

            {/* ── Locked warning ── */}
            {isLocked && selectedElection && (
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
                    Candidates cannot be edited or deleted while a voting
                    session is active.
                  </p>
                </div>
              </div>
            )}

            {/* ── Loading candidates ── */}
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
                  Loading candidates...
                </p>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && selectedElection && candidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <span className="text-4xl">👥</span>
                <p className="text-sm font-bold text-gray-400">
                  No candidates added yet
                </p>
                <button
                  onClick={() => navigate("/admin/candidates/create")}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#1a3a1a] text-white
                             text-xs font-black tracking-widest uppercase
                             hover:bg-[#152e15] transition-colors cursor-pointer"
                >
                  ➕ Add First Candidate
                </button>
              </div>
            )}

            {/* ── No election selected ── */}
            {!loading && !selectedElection && (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <span className="text-4xl">📋</span>
                <p className="text-sm font-bold text-gray-400">
                  Select an election above
                </p>
              </div>
            )}

            {/* ── Grouped candidates ── */}
            {!loading && selectedElection && candidates.length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedCandidates).map(
                  ([position, positionCandidates]) => (
                    <div key={position}>
                      {/* Position header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-6 rounded-full bg-[#2d6a2d]" />
                        <h3 className="text-sm font-black text-[#1a3a1a]">
                          {position}
                        </h3>
                        <span
                          className="text-[0.6rem] font-bold text-gray-400 bg-gray-100
                                       px-2 py-0.5 rounded-full"
                        >
                          {positionCandidates.length} candidate
                          {positionCandidates.length !== 1 ? "s" : ""}
                        </span>
                        <hr className="flex-1 border-gray-100" />
                      </div>

                      {/* Candidate cards */}
                      <div className="flex flex-col gap-2">
                        {positionCandidates.map((c) => (
                          <div
                            key={c.id}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5
                                     hover:bg-white hover:shadow-sm transition-all duration-150"
                          >
                            {/* ── Normal view ── */}
                            {editingCandidate !== c.id &&
                              showDeleteConfirm !== c.id && (
                                <div className="flex items-center gap-4">
                                  {/* Avatar */}
                                  <div
                                    className="w-10 h-10 rounded-xl bg-[#2d6a2d]/10
                                              border border-[#2d6a2d]/15
                                              flex items-center justify-center
                                              text-base font-black text-[#2d6a2d] shrink-0"
                                  >
                                    {c.name.charAt(0)}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-[#1a3a1a] truncate">
                                      {c.name}
                                    </p>
                                    {c.party && (
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {c.party}
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingCandidate(c.id);
                                        setEditCandidateForm({
                                          name: c.name,
                                          position: c.position,
                                          party: c.party || "",
                                        });
                                      }}
                                      disabled={isLocked}
                                      className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200
                                             text-xs font-bold text-[#2d6a2d] hover:bg-green-50
                                             hover:border-[#2d6a2d]/30 transition-colors cursor-pointer
                                             disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => setShowDeleteConfirm(c.id)}
                                      disabled={isLocked}
                                      className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200
                                             text-xs font-bold text-red-500 hover:bg-red-50
                                             hover:border-red-200 transition-colors cursor-pointer
                                             disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              )}

                            {/* ── Edit mode ── */}
                            {editingCandidate === c.id && (
                              <div className="space-y-3">
                                <p
                                  className="text-xs font-black text-[#2d6a2d]
                                            tracking-widest uppercase mb-2"
                                >
                                  ✏️ Editing: {c.name}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label
                                      className="block text-[0.6rem] font-bold text-gray-400
                                                    tracking-widest uppercase mb-1"
                                    >
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      value={editCandidateForm.name}
                                      onChange={(e) =>
                                        setEditCandidateForm({
                                          ...editCandidateForm,
                                          name: e.target.value,
                                        })
                                      }
                                      placeholder="Full name"
                                      style={{
                                        backgroundColor: "white",
                                        color: "#1a3a1a",
                                      }}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label
                                      className="block text-[0.6rem] font-bold text-gray-400
                                                    tracking-widest uppercase mb-1"
                                    >
                                      Position
                                    </label>
                                    <input
                                      type="text"
                                      value={editCandidateForm.position}
                                      onChange={(e) =>
                                        setEditCandidateForm({
                                          ...editCandidateForm,
                                          position: e.target.value,
                                        })
                                      }
                                      placeholder="Position"
                                      style={{
                                        backgroundColor: "white",
                                        color: "#1a3a1a",
                                      }}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label
                                      className="block text-[0.6rem] font-bold text-gray-400
                                                    tracking-widests uppercase mb-1"
                                    >
                                      Party
                                    </label>
                                    <input
                                      type="text"
                                      value={editCandidateForm.party}
                                      onChange={(e) =>
                                        setEditCandidateForm({
                                          ...editCandidateForm,
                                          party: e.target.value,
                                        })
                                      }
                                      placeholder="Party (optional)"
                                      style={{
                                        backgroundColor: "white",
                                        color: "#1a3a1a",
                                      }}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleSaveCandidate(c.id)}
                                    className="px-4 py-2 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                                             text-white text-xs font-black tracking-widest uppercase
                                             cursor-pointer transition-colors"
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCandidate(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-200
                                             text-gray-500 text-xs font-black tracking-widest uppercase
                                             hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* ── Delete confirm ── */}
                            {showDeleteConfirm === c.id && (
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">🗑️</span>
                                  <div>
                                    <p className="text-sm font-black text-red-600">
                                      Delete {c.name}?
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      This action cannot be undone
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteCandidate(c.id)}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700
                                             text-white text-xs font-black tracking-widest uppercase
                                             cursor-pointer transition-colors"
                                  >
                                    Confirm Delete
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-200
                                             text-gray-500 text-xs font-black tracking-widest uppercase
                                             hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidatesList;
