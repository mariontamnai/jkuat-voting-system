import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getElections } from '../../services/adminService';

const Elections = () => {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const admin = JSON.parse(sessionStorage.getItem('admin'));

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }

    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);

    const result = await getElections();

    if (result.success) {
      setElections(result.elections);
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === 'active') return '#2e7d32';
    if (status === 'completed') return '#1565c0';
    if (status === 'draft') return '#e65100';
    return '#777';
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            {/* Back Button */}
            <button
              className="back-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              ← Back to Dashboard
            </button>

            <h2>All Elections</h2>

            {/* Create Election Button */}
            <div
              className="admin-section"
              style={{
                marginBottom: '25px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/elections/create')}
              >
                + CREATE NEW ELECTION
              </button>
            </div>

            {/* Elections List */}
            <div className="admin-section">

              {loading ? (
                <div className="loading-text">
                  Loading elections...
                </div>

              ) : elections.length === 0 ? (

                <p
                  style={{
                    textAlign: 'center',
                    color: '#777',
                    padding: '20px'
                  }}
                >
                  No elections created yet
                </p>

              ) : (

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {elections.map((election) => (
                    <div
                      key={election.id}
                      style={{
                        border: '2px solid #c8e6c9',
                        borderRadius: '12px',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: '700',
                            fontSize: '0.95rem'
                          }}
                        >
                          {election.title}
                        </p>

                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: '#777',
                            marginTop: '4px'
                          }}
                        >
                          ID: {election.id}
                        </p>
                      </div>

                      <span
                        style={{
                          background: getStatusColor(election.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}
                      >
                        {election.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Elections;