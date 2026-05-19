import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    regNumber: '',
    email: '',
    password: '',
    role: 'electionOfficer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const admin = JSON.parse(sessionStorage.getItem('admin'));
  const token = sessionStorage.getItem('token');

  // Redirect if not mainAdmin
  if (!admin || admin.role !== 'mainAdmin') {
    navigate('/admin/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { regNumber, email, password, role } = form;

    if (!regNumber || !email || !password) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ regNumber, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Admin account created successfully! A welcome email has been sent to ${email}.`);
        setMessageType('success');
        setForm({ regNumber: '', email: '', password: '', role: 'electionOfficer' });
      } else {
        setMessage(data.message || 'Failed to create admin account');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Server error, please try again');
      setMessageType('error');
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
            <h2>Create Admin Account</h2>
            <p className="helper-text">Create a new Election Officer account</p>

            {message && (
              <div className={`alert alert-${messageType}`}>{message}</div>
            )}

            <div className="form-group">
              <label className="form-label">ADMIN ID (REG NUMBER)</label>
              <input
                type="text"
                name="regNumber"
                className="form-input"
                placeholder="e.g., EO001"
                value={form.regNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="e.g., officer@jkuat.ac.ke"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">TEMPORARY PASSWORD</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label className="form-label">ROLE</label>
              <select
                name="role"
                className="form-input"
                value={form.role}
                onChange={handleChange}
              >
                <option value="electionOfficer">Election Officer</option>
                <option value="mainAdmin">Main Admin</option>
              </select>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAdmin;