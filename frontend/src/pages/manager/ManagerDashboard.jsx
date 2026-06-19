import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/leaves/all-requests/')
      .then((res) => setRequests(res.data))
      .catch((err) => console.error('Failed to load requests', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;
  const totalCount = requests.length;

  const pendingRequests = requests.filter((r) => r.status === 'PENDING').slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Manager Dashboard 👔
          </h1>
          <p className="page-subtitle">
            Welcome, {user?.first_name || user?.username}. Here's the leave overview.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card--warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{approvedCount}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <span className="stat-value">{rejectedCount}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>
      </div>

      {/* Pending requests preview */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⏳ Pending Requests (Needs Action)</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.employee_name}</strong></td>
                    <td>{r.leave_type_name}</td>
                    <td>{r.start_date} → {r.end_date}</td>
                    <td>{r.leave_days}</td>
                    <td className="td-reason">{r.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
