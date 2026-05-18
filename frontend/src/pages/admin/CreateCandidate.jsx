import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { addCandidate } from '../../services/adminService';

const CreateCandidate = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const electionId = sessionStorage.getItem('electionId');

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: '',
    party: ''
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const handleAddCandidate = async () => {
    const result = await addCandidate(
      electionId,
      newCandidate
    );

    if (result.success) {
      showMessage(
        'Candidate added successfully!',
        'success'
      );

      setNewCandidate({
        name: '',
        position: '',
        party: ''
      });

      setTimeout(() => {
        navigate('/admin/candidates/list');
      }, 1200);

    } else {
      showMessage(
        result.message || 'Failed to add candidate',
        'error'
      );
    }
  };

  return (
    <div className="voting-system">
      <div className="bg-animation" />

      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card">

            <button
              className="back-btn"
              onClick={() => navigate('/admin/candidates')}
            >
              ← Back to Candidates
            </button>

            <h2>Add Candidate</h2>

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
                placeholder="Candidate Name"
                value={newCandidate.name}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    name: e.target.value
                  })
                }
              />

              <input
                className="form-input"
                placeholder="Position (e.g President)"
                value={newCandidate.position}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    position: e.target.value
                  })
                }
              />

              <input
                className="form-input"
                placeholder="Party (optional)"
                value={newCandidate.party}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    party: e.target.value
                  })
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleAddCandidate}
                disabled={
                  !newCandidate.name ||
                  !newCandidate.position
                }
              >
                SAVE CANDIDATE
              </button>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCandidate;