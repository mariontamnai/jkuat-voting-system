import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { createElection } from '../../services/adminService';

const CreateElection = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleCreateElection = async () => {
    const result = await createElection(newElection);

    if (result.success) {
      showMessage('Election created successfully!', 'success');

      setTimeout(() => {
        navigate('/admin/elections');
      }, 1500);

    } else {
      showMessage(result.message || 'Failed to create election', 'error');
    }
  };

  return (
    <div className="voting-system">
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            <button
              className="back-btn"
              onClick={() => navigate('/admin/elections')}
            >
              ← Back to Elections
            </button>

            <h2>Create Election</h2>

            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <input
                className="form-input"
                placeholder="Election Title"
                value={newElection.title}
                onChange={(e) =>
                  setNewElection({
                    ...newElection,
                    title: e.target.value
                  })
                }
              />

              <input
                className="form-input"
                placeholder="Description (optional)"
                value={newElection.description}
                onChange={(e) =>
                  setNewElection({
                    ...newElection,
                    description: e.target.value
                  })
                }
              />

              <label className="form-label">START DATE</label>

              <input
                className="form-input"
                type="datetime-local"
                value={newElection.startDate}
                onChange={(e) =>
                  setNewElection({
                    ...newElection,
                    startDate: e.target.value
                  })
                }
              />

              <label className="form-label">END DATE</label>

              <input
                className="form-input"
                type="datetime-local"
                value={newElection.endDate}
                onChange={(e) =>
                  setNewElection({
                    ...newElection,
                    endDate: e.target.value
                  })
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleCreateElection}
                disabled={
                  !newElection.title ||
                  !newElection.startDate ||
                  !newElection.endDate
                }
              >
                SAVE ELECTION
              </button>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CreateElection;