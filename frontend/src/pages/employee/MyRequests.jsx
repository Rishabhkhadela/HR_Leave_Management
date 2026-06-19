import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/leaves/my-requests/');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    setCancellingId(id);
    try {
      await API.patch(`/leaves/cancel/${id}/`);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leave Requests</h1>
          <p className="page-subtitle">Track the status of all your leave requests</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No leave requests yet</h3>
          <p>You haven't submitted any leave requests.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table" id="my-requests-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.leave_type_name}</strong></td>
                    <td>{r.start_date}</td>
                    <td>{r.end_date}</td>
                    <td>{r.leave_days}</td>
                    <td className="td-reason">{r.reason || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="td-reason">{r.rejection_reason || '—'}</td>
                    <td>
                      {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                        <button
                          className="btn btn--sm btn--danger"
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                        >
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
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
