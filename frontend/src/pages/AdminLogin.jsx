import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { loginAdmin, verifyAdminOtp } from '../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingAdminId, setPendingAdminId] = useState('');

  // ==============================
  // STEP 1 — Password login
  // ==============================
  const handleLogin = async () => {
    if (!adminId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginAdmin(adminId, password);

    if (result.success && result.otpSent) {
      setPendingAdminId(result.adminId);
      setOtpStep(true);
    } else {
      setError(result.message || 'Invalid credentials');
    }

    setLoading(false);
  };

  // ==============================
  // STEP 2 — OTP verification
  // ==============================
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyAdminOtp(pendingAdminId, otp);

    if (result.success) {
      sessionStorage.setItem('admin', JSON.stringify(result.user));
      sessionStorage.setItem('token', result.token);
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Invalid OTP');
    }

    setLoading(false);
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            {/* ====== STEP 1: PASSWORD LOGIN ====== */}
            {!otpStep && (
              <>
                <h2>Admin Login</h2>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">ADMIN ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., ADM001"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PASSWORD</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? 'VERIFYING...' : 'LOGIN'}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/')}
                  >
                    BACK TO HOME
                  </button>
                </div>
              </>
            )}

            {/* ====== STEP 2: OTP VERIFICATION ====== */}
            {otpStep && (
              <>
                <h2>Enter OTP</h2>
                <p style={{ color: '#888', marginBottom: '20px', textAlign: 'center' }}>
                  A 6-digit OTP has been sent to the registered admin email. It expires in 5 minutes.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">ONE TIME PASSWORD (OTP)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
                    style={{ letterSpacing: '8px', fontSize: '24px', textAlign: 'center' }}
                  />
                </div>

                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp('');
                      setError('');
                    }}
                  >
                    BACK
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;