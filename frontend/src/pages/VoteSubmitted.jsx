import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VoteSubmitted = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [votedFor, setVotedFor] = useState(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const storedVote = JSON.parse(sessionStorage.getItem("votedFor"));
    if (!storedUser || !token) {
      navigate("/student-login");
      return;
    }
    setUser(storedUser);
    setVotedFor(storedVote);
  }, []);

  const handleLogout = () => {
    ["token", "votingToken", "user", "votedFor"].forEach((k) =>
      sessionStorage.removeItem(k),
    );
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
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7 text-center">
            {/* Animated checkmark circle */}
            <div
              className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30
                            flex items-center justify-center mx-auto mb-4
                            shadow-lg shadow-black/20"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="checkmark" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">
              Vote Submitted!
            </h2>
            <p className="text-white/60 text-xs font-light mt-1 tracking-wide">
              Your vote has been securely recorded
            </p>
          </div>

          <div className="px-8 py-7">
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
                <span className="w-2 h-2 rounded-full bg-[#2d6a2d]" />
                <span className="text-[0.6rem] font-black text-[#2d6a2d] tracking-widest uppercase">
                  Voted
                </span>
              </div>
            </div>

            {/* ── Thank you message ── */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 leading-relaxed">
                Thank you for participating in the{" "}
                <span className="font-bold text-[#1a3a1a]">
                  JKUSA Student Leaders Election
                </span>
                . Your vote has been encrypted and securely recorded on the
                system.
              </p>
            </div>

            {/* ── Voted for card ── */}
            {votedFor && (
              <div
                className="flex items-center gap-4 bg-green-50 border border-green-200
                              rounded-xl px-5 py-4 mb-6"
              >
                <div
                  className="w-10 h-10 rounded-full bg-[#2d6a2d]/10 border border-[#2d6a2d]/20
                                flex items-center justify-center text-lg shrink-0"
                >
                  🧑‍🎓
                </div>
                <div>
                  <p className="text-[0.65rem] font-black text-[#2d6a2d] tracking-widest uppercase mb-0.5">
                    You Voted For
                  </p>
                  <p className="text-base font-black text-[#1a3a1a]">
                    {votedFor.name}
                  </p>
                  {votedFor.faculty && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {votedFor.faculty}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── What's next info ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-6">
              <p className="text-[0.65rem] font-black text-amber-700 tracking-widest uppercase mb-2">
                📢 What's Next
              </p>
              <ul className="space-y-1.5">
                {[
                  "Results are updated live as votes come in",
                  "Final results are published once voting closes",
                  "You cannot modify your vote after submission",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-amber-800"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Actions
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Buttons ── */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/results")}
                className="w-full py-3.5 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                           text-white text-xs font-black tracking-widest uppercase
                           cursor-pointer transition-colors duration-150
                           flex items-center justify-center gap-2"
              >
                📊 View Live Results
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-lg border border-red-200
                           text-red-500 text-xs font-black tracking-widest uppercase
                           hover:bg-red-50 hover:border-red-300
                           transition-colors duration-150 cursor-pointer"
              >
                Logout
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5 mt-5 text-[0.68rem] text-gray-500 font-light">
              🔒 Your vote is encrypted with AES-256
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VoteSubmitted;
