import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import RejectModal from '../../components/RejectModal';

export default function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });

  const fetchRequests = async () => {
    try {
      const url = statusFilter
        ? `/leaves/all-requests/?status=${statusFilter}`
        : '/leaves/all-requests/';
      const res = await API.get(url);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this leave request?')) return;
    setApprovingId(id);
    try {
      await API.patch(`/leaves/approve/${id}/`);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    await API.patch(`/leaves/reject/${id}/`, { rejection_reason: reason });
    await fetchRequests();
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
          <h1 className="page-title">All Leave Requests</h1>
          <p className="page-subtitle">Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <label className="filter-label">Filter by status:</label>
        <div className="filter-chips">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'filter-chip--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No requests found</h3>
          <p>There are no leave requests matching your filter.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table" id="all-requests-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.employee_name}</strong></td>
                    <td>{r.leave_type_name}</td>
                    <td>{r.start_date}</td>
                    <td>{r.end_date}</td>
                    <td>{r.leave_days}</td>
                    <td className="td-reason">{r.reason || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="td-reason">{r.rejection_reason || '—'}</td>
                    <td>
                      {r.status === 'PENDING' && (
                        <div className="action-btns">
                          <button
                            className="btn btn--sm btn--success"
                            onClick={() => handleApprove(r.id)}
                            disabled={approvingId === r.id}
                          >
                            {approvingId === r.id ? '...' : '✓ Approve'}
                          </button>
                          <button
                            className="btn btn--sm btn--danger"
                            onClick={() => setRejectModal({ open: true, id: r.id })}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RejectModal
        isOpen={rejectModal.open}
        requestId={rejectModal.id}
        onClose={() => setRejectModal({ open: false, id: null })}
        onReject={handleReject}
      />
    </div>
  );
}
