import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return '#2e7d32';
      case 'FAILURE': return '#c62828';
      case 'INFO': return '#1565c0';
      default: return '#888';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('LOGIN')) return '🔐';
    if (action.includes('REGISTER') || action.includes('CREATE')) return '➕';
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('VOTE')) return '🗳️';
    if (action.includes('ELECTION')) return '📋';
    if (action.includes('FACE') || action.includes('BIOMETRIC')) return '👤';
    if (action.includes('PASSWORD')) return '🔑';
    if (action.includes('RESET')) return '⚠️';
    return '📝';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' || log.status === filter;
    const matchesSearch =
      search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(search)) ||
      (log.userModel && log.userModel.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="voting-system">
      <div className="bg-animation" />
      <div className="container">
        <Header />

        <div className="screen-container">
          <div className="card" style={{ maxWidth: '900px', width: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Audit Logs</h2>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
                  Last 50 system activities
                </p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/dashboard')}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                ← BACK TO DASHBOARD
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by action, IP, or user type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="INFO">Info</option>
              </select>
              <button
                className="btn btn-outline"
                onClick={fetchLogs}
                style={{ fontSize: '14px', padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['SUCCESS', 'FAILURE', 'INFO'].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: s === 'SUCCESS' ? '#e8f5e9' : s === 'FAILURE' ? '#ffebee' : '#e3f2fd',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: '700', color: getStatusColor(s) }}>
                    {logs.filter((l) => l.status === s).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{s}</div>
                </div>
              ))}
              <div
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#f5f5f5',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {logs.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>TOTAL</div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Loading audit logs...
              </div>
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No logs found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredLogs.map((log, index) => (
                  <div
                    key={log._id || index}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#f9f9f9',
                      border: '1px solid #eee',
                      borderLeft: `4px solid ${getStatusColor(log.status)}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      {/* Left: action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getActionIcon(log.action)}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#222' }}>
                            {log.action.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                            {log.userModel || 'System'} • IP: {log.ipAddress || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Right: status + time */}
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#fff',
                            background: getStatusColor(log.status),
                            marginBottom: '4px',
                          }}
                        >
                          {log.status}
                        </span>
                        <div style={{ fontSize: '11px', color: '#aaa' }}>
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Details if present */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          background: '#f0f0f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#555',
                          fontFamily: 'monospace',
                        }}
                      >
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuditLogs;