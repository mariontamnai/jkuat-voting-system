import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { addCandidate } from "../../services/adminService";

const inputClass = `
  w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none
  placeholder-gray-300 focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
  transition-all duration-150
`;

const CreateCandidate = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    party: "",
  });

  const electionId = sessionStorage.getItem("electionId");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleAddCandidate = async () => {
    setLoading(true);
    const result = await addCandidate(electionId, newCandidate);
    if (result.success) {
      showMessage("Candidate added successfully!", "success");
      setNewCandidate({ name: "", position: "", party: "" });
      setTimeout(() => navigate("/admin/candidates/list"), 1200);
    } else {
      showMessage(result.message || "Failed to add candidate", "error");
    }
    setLoading(false);
  };

  const isValid = newCandidate.name.trim() && newCandidate.position.trim();

  const preview = newCandidate.name || newCandidate.position;

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
                  Add Candidate
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  Register a new candidate for this election
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
              className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 mb-6
                             transition-all duration-200
                             ${
                               preview
                                 ? "bg-green-50 border-green-200"
                                 : "bg-gray-50 border-gray-100"
                             }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center
                               text-lg font-black shrink-0 transition-all duration-200
                               ${
                                 preview
                                   ? "bg-[#2d6a2d]/15 border border-[#2d6a2d]/20 text-[#2d6a2d]"
                                   : "bg-gray-200 text-gray-400"
                               }`}
              >
                {newCandidate.name
                  ? newCandidate.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-black truncate transition-colors duration-200
                               ${preview ? "text-[#1a3a1a]" : "text-gray-300"}`}
                >
                  {newCandidate.name || "Candidate Name"}
                </p>
                <p
                  className={`text-xs mt-0.5 truncate transition-colors duration-200
                               ${newCandidate.position ? "text-[#2d6a2d]" : "text-gray-300"}`}
                >
                  {newCandidate.position || "Position"}
                  {newCandidate.party && (
                    <span className="text-gray-400">
                      {" "}
                      · {newCandidate.party}
                    </span>
                  )}
                </p>
              </div>
              <span
                className="text-[0.6rem] font-black tracking-widest uppercase shrink-0
                               text-gray-300"
              >
                Preview
              </span>
            </div>

            {/* ── Form fields ── */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label
                  className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                  tracking-widest uppercase mb-2"
                >
                  Candidate Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={newCandidate.name}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, name: e.target.value })
                  }
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={inputClass}
                />
              </div>

              {/* Position */}
              <div>
                <label
                  className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                  tracking-widests uppercase mb-2"
                >
                  Position <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. President, Secretary General"
                  value={newCandidate.position}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      position: e.target.value,
                    })
                  }
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={inputClass}
                />
              </div>

              {/* Party */}
              <div>
                <label
                  className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                  tracking-widest uppercase mb-2"
                >
                  Party / Affiliation{" "}
                  <span className="text-gray-300 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Independent, JKUSA United"
                  value={newCandidate.party}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, party: e.target.value })
                  }
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Required note ── */}
            <p className="text-xs text-gray-300 mt-3 mb-6">
              <span className="text-red-400">*</span> Required fields
            </p>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Save
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Submit button ── */}
            <button
              onClick={handleAddCandidate}
              disabled={!isValid || loading}
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
                  Saving...
                </>
              ) : (
                "➕ Save Candidate"
              )}
            </button>

            <button
              onClick={() => navigate("/admin/candidates/list")}
              className="w-full mt-3 py-3.5 rounded-lg border border-[#2d6a2d]/25
                         text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                         hover:bg-green-50 hover:border-[#2d6a2d]/50
                         transition-colors duration-150 cursor-pointer"
            >
              View All Candidates →
            </button>

            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Changes are saved to the active election
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCandidate;
