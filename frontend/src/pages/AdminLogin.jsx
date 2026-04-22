import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { loginAdmin } from '../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!adminId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginAdmin(adminId, password);

    if (result.success) {
      sessionStorage.setItem('admin', JSON.stringify(result.user));
      sessionStorage.setItem('token', result.token);
      navigate('/admin/dashboard');
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
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;