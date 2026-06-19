export default function StatusBadge({ status }) {
  const statusConfig = {
    PENDING: { label: 'Pending', className: 'status-badge--pending' },
    APPROVED: { label: 'Approved', className: 'status-badge--approved' },
    REJECTED: { label: 'Rejected', className: 'status-badge--rejected' },
    CANCELLED: { label: 'Cancelled', className: 'status-badge--cancelled' },
  };

  const config = statusConfig[status] || { label: status, className: '' };

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
