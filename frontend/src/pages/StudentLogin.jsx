import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { loginStudent } from '../services/authService';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!regNo || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginStudent(regNo, password);

    if (result.success) {
      // Save user to session storage
      sessionStorage.setItem('user', JSON.stringify(result.user));
      navigate('/face-recognition');
    } else {
      setError(result.message || 'Invalid credentials');
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
            <h2>Student Login</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">REGISTRATION NUMBER</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., SCT111-0111/1900"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/')}
              >
                BACK TO HOME
              </button>

              <p className="helper-text">Want to explore without an account?</p>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  sessionStorage.setItem('user', JSON.stringify({
                    id: 999,
                    name: "Demo User",
                    regNo: "DEMO001",
                    hasVoted: false,
                    sessionToken: "DEMO",
                    role: "student"
                  }));
                  navigate('/face-recognition');
                }}
              >
                TRY DEMO
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentLogin;