import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { loginStudent } from "../services/authService";

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

const StudentLogin = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!regNo || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const result = await loginStudent(regNo, password);
    if (result.success) {
      sessionStorage.setItem("user", JSON.stringify(result.user));
      sessionStorage.setItem("token", result.token);
      navigate(
        result.user.isFirstLogin ? "/change-password" : "/face-recognition",
      );
    } else {
      setError(result.message || "Invalid credentials");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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
          {/* ── Card top banner ── */}
          <div className="bg-gradient-to-br from-[#2d6a2d] to-[#1a4a1a] px-8 pt-8 pb-7 text-center">
            <div
              className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20
                            flex items-center justify-center text-3xl mx-auto mb-4"
            >
              🎓
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">
              Student Login
            </h2>
            <p className="text-white/60 text-xs font-light mt-1 tracking-wide">
              Enter your credentials to access the voting portal
            </p>
          </div>

          {/* ── Form body ── */}
          <div className="px-8 py-7">
            {/* Error alert */}
            {error && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-700 rounded-lg px-4 py-3 text-sm font-semibold mb-5"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Number */}
            <div className="mb-5">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. SCT111-0111/1900"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ backgroundColor: "white", color: "#1a3a1a" }}
                className="w-full px-4 py-3 rounded-lg border border-gray-200
                           text-sm outline-none placeholder-gray-300
                           focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                           transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label
                className="block text-[0.7rem] font-bold text-[#2d6a2d]
                                tracking-widest uppercase mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200
                             text-sm outline-none placeholder-gray-300
                             focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                             transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-[#2d6a2d] transition-colors duration-150
                             cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <p className="text-center text-xs text-gray-400 mb-6 mt-3">
              Forgot your password?{" "}
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-[#2d6a2d] font-bold cursor-pointer hover:underline"
              >
                Reset it here
              </span>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-[0.65rem] text-gray-300 tracking-widest uppercase">
                Secure Login
              </span>
              <hr className="flex-1 border-gray-100" />
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#2d6a2d] hover:bg-[#245a24]
                         text-white text-xs font-black tracking-widest uppercase
                         cursor-pointer transition-colors duration-150
                         flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
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
                  Logging in...
                </>
              ) : (
                "🔐 Login"
              )}
            </button>

            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              className="w-full mt-3 py-3.5 rounded-lg border border-[#2d6a2d]/25
                         text-[#2d6a2d] text-xs font-black tracking-widest uppercase
                         hover:bg-green-50 hover:border-[#2d6a2d]/50
                         transition-colors duration-150 cursor-pointer"
            >
              ← Back to Home
            </button>

            {/* Security note */}
            <p
              className="flex items-center justify-center gap-1.5 mt-5
                          text-[0.68rem] text-gray-300 font-light"
            >
              🔒 Your session is encrypted with AES-256
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentLogin;
