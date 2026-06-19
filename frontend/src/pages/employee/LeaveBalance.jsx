import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function LeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/leaves/balance/')
      .then((res) => setBalances(res.data))
      .catch((err) => console.error('Failed to load balances', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading balances...</p>
      </div>
    );
  }

  const typeIcons = {
    'Vacation': '🏖️',
    'Sick': '🏥',
    'Casual': '☕',
  };

  const typeColors = {
    'Vacation': '#6366f1',
    'Sick': '#ef4444',
    'Casual': '#f59e0b',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Balance</h1>
          <p className="page-subtitle">Your current leave allocation and usage</p>
        </div>
      </div>

      <div className="balance-detail-grid">
        {balances.map((b) => {
          const pct = b.total_days > 0 ? ((b.remaining_days / b.total_days) * 100) : 0;
          const icon = typeIcons[b.leave_type_name] || '📋';
          const color = typeColors[b.leave_type_name] || '#6366f1';

          return (
            <div key={b.id} className="balance-detail-card" style={{ '--accent': color }}>
              <div className="balance-detail-icon">{icon}</div>
              <h3 className="balance-detail-type">{b.leave_type_name}</h3>

              <div className="balance-detail-circle">
                <svg viewBox="0 0 120 120" className="circle-progress">
                  <circle cx="60" cy="60" r="52" className="circle-bg" />
                  <circle
                    cx="60" cy="60" r="52"
                    className="circle-fill"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 52}`,
                      strokeDashoffset: `${2 * Math.PI * 52 * (1 - pct / 100)}`,
                      stroke: color,
                    }}
                  />
                </svg>
                <div className="circle-text">
                  <span className="circle-value">{b.remaining_days}</span>
                  <span className="circle-label">left</span>
                </div>
              </div>

              <div className="balance-detail-stats">
                <div className="balance-stat">
                  <span className="balance-stat-value">{b.total_days}</span>
                  <span className="balance-stat-label">Total</span>
                </div>
                <div className="balance-stat-divider"></div>
                <div className="balance-stat">
                  <span className="balance-stat-value">{b.used_days}</span>
                  <span className="balance-stat-label">Used</span>
                </div>
                <div className="balance-stat-divider"></div>
                <div className="balance-stat">
                  <span className="balance-stat-value" style={{ color }}>{b.remaining_days}</span>
                  <span className="balance-stat-label">Remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
