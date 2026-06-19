import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, reqRes] = await Promise.all([
          API.get('/leaves/balance/'),
          API.get('/leaves/my-requests/'),
        ]);
        setBalances(balRes.data);
        setRequests(reqRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
  const totalRemaining = balances.reduce((sum, b) => sum + b.remaining_days, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="page-subtitle">Here's your leave overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{totalRemaining}</span>
            <span className="stat-label">Days Remaining</span>
          </div>
        </div>
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
            <span className="stat-label">Approved Leaves</span>
          </div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Leave Balance Overview</h2>
        </div>
        <div className="balance-grid">
          {balances.map((b) => {
            const pct = b.total_days > 0 ? ((b.remaining_days / b.total_days) * 100) : 0;
            return (
              <div key={b.id} className="balance-card">
                <div className="balance-card-header">
                  <span className="balance-type">{b.leave_type_name}</span>
                  <span className="balance-fraction">
                    {b.remaining_days}/{b.total_days}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%` }}
                    data-pct={Math.round(pct)}
                  ></div>
                </div>
                <div className="balance-card-footer">
                  <span className="balance-used">{b.used_days} used</span>
                  <span className="balance-remaining">{b.remaining_days} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Requests</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>{r.leave_type_name}</td>
                    <td>{r.start_date} → {r.end_date}</td>
                    <td>{r.leave_days}</td>
                    <td>
                      <span className={`status-badge status-badge--${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
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
