import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!regNumber || !email) {
      setError('Please fill in all fields');
      return;
    }

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
          <div className="card">
            {!success ? (
              <>
                <h2>Forgot Password</h2>
                <p className="helper-text">
                  Enter your registration number and email address and we'll send you a password reset link.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">REGISTRATION NUMBER</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., SCT111-0111/1900"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/student-login')}
                  >
                    BACK TO LOGIN
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="success-container">
                  <div className="success-icon">✓</div>
                  <h2>Check Your Email</h2>
                  <p className="description">
                    We've sent a password reset link to <strong>{email}</strong>.
                    Please check your inbox and follow the instructions.
                  </p>
                  <p className="helper-text">
                    The link will expire in 1 hour.
                  </p>
                </div>

                <div className="button-group" style={{ marginTop: '20px' }}>
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