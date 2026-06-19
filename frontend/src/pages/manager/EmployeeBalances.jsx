import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function EmployeeBalances() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/leaves/employee-balances/')
      .then((res) => {
        // Group balances by employee
        const grouped = {};
        res.data.forEach((b) => {
          if (!grouped[b.employee_id]) {
            grouped[b.employee_id] = {
              employee_id: b.employee_id,
              employee_name: b.employee_name,
              username: b.username,
              balances: [],
            };
          }
          grouped[b.employee_id].balances.push(b);
        });
        setBalances(Object.values(grouped));
      })
      .catch((err) => console.error('Failed to load balances', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading employee balances...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Balances</h1>
          <p className="page-subtitle">Overview of all employee leave balances</p>
        </div>
      </div>

      {balances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No employees found</h3>
          <p>There are no employee balances to display.</p>
        </div>
      ) : (
        <div className="employee-balance-grid">
          {balances.map((emp) => (
            <div key={emp.employee_id} className="employee-balance-card">
              <div className="emp-card-header">
                <div className="emp-avatar">
                  {emp.employee_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'}
                </div>
                <div className="emp-info">
                  <h3 className="emp-name">{emp.employee_name}</h3>
                  <span className="emp-username">@{emp.username}</span>
                </div>
              </div>
              <div className="emp-balances">
                {emp.balances.map((b, i) => {
                  const pct = b.total_days > 0 ? (b.remaining_days / b.total_days) * 100 : 0;
                  return (
                    <div key={i} className="emp-balance-row">
                      <div className="emp-balance-info">
                        <span className="emp-balance-type">{b.leave_type_name}</span>
                        <span className="emp-balance-nums">
                          {b.remaining_days}/{b.total_days}
                        </span>
                      </div>
                      <div className="progress-bar progress-bar--sm">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
