import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { resetAllData } from '../../services/adminService';

const Settings = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const phase =
    sessionStorage.getItem('adminPhase') || 'idle';

  const handleResetData = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset ALL election data? This cannot be undone!'
    );

    if (!confirmReset) return;

    const result = await resetAllData();

    if (result.success) {
      sessionStorage.removeItem('adminPhase');
      sessionStorage.removeItem('electionId');

      showMessage(
        'All data reset successfully!',
        'success'
      );
    } else {
      showMessage(
        result.message || 'Failed to reset data',
        'error'
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">
            <h2>System Settings</h2>

            <p className="helper-text">
              Administrative and dangerous actions
            </p>

            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            <div className="admin-section">
              <h3 className="admin-section-title">
                Danger Zone
              </h3>

              <div className="button-group">
                <button
                  className="btn btn-danger"
                  onClick={handleResetData}
                  disabled={phase === 'voting'}
                >
                  RESET ALL DATA
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  LOGOUT
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
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

export default Settings;