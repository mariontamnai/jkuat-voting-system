import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { changePassword } from "../services/authService";

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const inputClass = `
  w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none
  placeholder-gray-300 focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
  transition-all duration-150
`;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;
  const passwordStrong = newPassword.length >= 6;

  // Simple strength score
  const strengthScore = (() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthConfig = [
    { label: "", cls: "" },
    { label: "Weak", cls: "text-red-500" },
    { label: "Fair", cls: "text-amber-500" },
    { label: "Good", cls: "text-blue-500" },
    { label: "Strong", cls: "text-green-500" },
    { label: "Very Strong", cls: "text-green-600" },
  ];

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const result = await changePassword(newPassword);
    if (result.success) {
      const updatedUser = { ...user, isFirstLogin: false };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/face-recognition");
    } else {
      setError(result.message || "Failed to change password");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleChangePassword();
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
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7 text-center">
            {/* Lock icon */}
            <div
              className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20
                            flex items-center justify-center mx-auto mb-4"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">
              Set Your Password
            </h2>
            <p className="text-white/60 text-xs font-light mt-1">
              Welcome,{" "}
              <span className="text-white/80 font-semibold">
                {user?.name || "Student"}
              </span>
              ! Please set a password before continuing.
            </p>
          </div>

          <div className="px-8 py-7">
            {/* ── First login notice ── */}
            <div
              className="flex items-start gap-3 bg-blue-50 border border-blue-200
                            rounded-xl px-4 py-3.5 mb-6"
            >
              <span className="text-lg mt-0.5">ℹ️</span>
              <div>
                <p className="text-xs font-black text-blue-700 mb-0.5">
                  First Login
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Your account was set up with a temporary password. You must
                  create a new password before you can access the voting system.
                </p>
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-700 rounded-xl px-4 py-3 text-sm font-semibold mb-5"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── New password ── */}
            <div className="mb-5">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-[#2d6a2d] transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300
                                    ${
                                      i <= strengthScore
                                        ? strengthScore <= 1
                                          ? "bg-red-400"
                                          : strengthScore <= 2
                                            ? "bg-amber-400"
                                            : strengthScore <= 3
                                              ? "bg-blue-400"
                                              : "bg-green-500"
                                        : "bg-gray-200"
                                    }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    {passwordTooShort ? (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <span>⚠️</span> At least 6 characters required
                      </p>
                    ) : (
                      <p
                        className={`text-xs font-bold ${strengthConfig[strengthScore]?.cls}`}
                      >
                        {strengthConfig[strengthScore]?.label}
                      </p>
                    )}
                    <p className="text-xs text-gray-300">
                      {newPassword.length} chars
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Confirm password ── */}
            <div className="mb-6">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className={`${inputClass} pr-12
                    ${passwordsMismatch ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
                    ${passwordsMatch ? "border-green-300 focus:border-green-400 focus:ring-green-100" : ""}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-[#2d6a2d] transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs font-bold mt-1.5 flex items-center gap-1
                               ${passwordsMatch ? "text-green-500" : "text-red-400"}`}
                >
                  <span>{passwordsMatch ? "✅" : "⚠️"}</span>
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Confirm
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* ── Submit ── */}
            <button
              onClick={handleChangePassword}
              disabled={
                loading ||
                !passwordStrong ||
                passwordsMismatch ||
                !confirmPassword
              }
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
                "🔐 Set Password & Continue"
              )}
            </button>

            <button
              onClick={() => navigate("/student-login")}
              className="w-full mt-3 py-3 rounded-lg text-gray-400 text-xs
                         font-bold tracking-widest uppercase hover:text-gray-600
                         transition-colors cursor-pointer"
            >
              ← Back to Login
            </button>

            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Your password is securely encrypted
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChangePassword;
