import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/leaves/balance/')
      .then((res) => {
        setBalances(res.data);
        // Extract unique leave types from balances
        const types = res.data.map((b) => ({
          id: b.leave_type,
          name: b.leave_type_name,
          remaining: b.remaining_days,
        }));
        setLeaveTypes(types);
      })
      .catch((err) => console.error('Failed to load leave types', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end >= start) {
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff;
      }
    }
    return 0;
  };

  const selectedBalance = balances.find(
    (b) => b.leave_type === Number(formData.leave_type)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await API.post('/leaves/apply/', {
        leave_type: Number(formData.leave_type),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      });
      setSuccess('Leave request submitted successfully!');
      setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
      setTimeout(() => navigate('/employee/requests'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        // Collect all error messages
        const messages = Object.entries(data)
          .map(([key, val]) => {
            const msg = Array.isArray(val) ? val.join(', ') : val;
            return key === 'non_field_errors' ? msg : `${key}: ${msg}`;
          })
          .join(' | ');
        setError(messages);
      } else {
        setError('Failed to submit leave request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const days = calculateDays();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Apply for Leave</h1>
          <p className="page-subtitle">Fill in the details below to submit a leave request</p>
        </div>
      </div>

      <div className="form-card">
        {error && (
          <div className="alert alert--error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert--success">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="form-group">
            <label htmlFor="leave-type" className="form-label">
              Leave Type <span className="required">*</span>
            </label>
            <select
              id="leave-type"
              name="leave_type"
              className="form-select"
              value={formData.leave_type}
              onChange={handleChange}
              required
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.remaining} days remaining)
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date" className="form-label">
                Start Date <span className="required">*</span>
              </label>
              <input
                id="start-date"
                type="date"
                name="start_date"
                className="form-input"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date" className="form-label">
                End Date <span className="required">*</span>
              </label>
              <input
                id="end-date"
                type="date"
                name="end_date"
                className="form-input"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {days > 0 && (
            <div className="days-preview">
              <span className="days-preview-icon">📅</span>
              <span>
                <strong>{days}</strong> day{days > 1 ? 's' : ''} of leave
                {selectedBalance && (
                  <>
                    {' '}· {selectedBalance.remaining_days} days available
                    {days > selectedBalance.remaining_days && (
                      <span className="text-danger"> (insufficient balance!)</span>
                    )}
                  </>
                )}
              </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason</label>
            <textarea
              id="reason"
              name="reason"
              className="form-textarea"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Optional: provide a reason for your leave..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/employee/requests')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
              id="apply-leave-submit"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
