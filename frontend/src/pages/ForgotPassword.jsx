import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [regNumberError, setRegNumberError] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setEmailError(false);
    setRegNumberError(false);

    let hasError = false;
    
    if (!regNumber) {
      setRegNumberError(true);
      setError('Please enter your registration number');
      hasError = true;
    }
    
    if (!email) {
      setEmailError(true);
      setError('Please enter your email address');
      hasError = true;
      return;
    }

    if (email && !emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g. name@example.com)');
      setEmailError(true);
      return;
    }

    if (hasError) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNumber, email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card forgot-password-card">
            {!success ? (
              <>
                {/* Icon */}
                <div className="forgot-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <line x1="12" y1="15" x2="12" y2="15.01" />
                  </svg>
                </div>

                <h2 className="forgot-title">Forgot Password?</h2>
                <p className="forgot-description">
                  Enter your registration number and email address and we'll send you a password reset link.
                </p>

                {error && (
                  <div className="alert alert-error forgot-alert">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">REGISTRATION NUMBER</label>
                  <input
                    type="text"
                    className={`form-input ${regNumberError ? 'input-error' : ''}`}
                    placeholder="e.g., SCT111-0111/1900"
                    value={regNumber}
                    onChange={(e) => {
                      setRegNumber(e.target.value);
                      setRegNumberError(false);
                    }}
                  />
                  {regNumberError && (
                    <p className="input-error-hint">Registration number is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className={`form-input ${emailError ? 'input-error' : ''}`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                  />
                  {emailError && (
                    <p className="input-error-hint">Please enter a valid email address</p>
                  )}
                </div>

                <div className="button-group forgot-buttons">
                  <button
                    className="btn btn-primary forgot-submit-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        SENDING...
                      </>
                    ) : (
                      'SEND RESET LINK'
                    )}
                  </button>

                  <button
                    className="btn btn-outline back-to-login-btn"
                    onClick={() => navigate('/student-login')}
                  >
                    ← BACK TO LOGIN
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="success-container forgot-success">
                  <div className="success-icon forgot-success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h2 className="forgot-success-title">Check Your Email</h2>
                  <p className="forgot-success-message">
                    We've sent a password reset link to <strong>{email}</strong>.
                  </p>
                  <p className="forgot-success-hint">
                    Please check your inbox and follow the instructions. The link will expire in 1 hour.
                  </p>
                  <p className="forgot-success-note">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="button-group forgot-success-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/student-login')}
                  >
                    BACK TO LOGIN
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

export default ForgotPassword;