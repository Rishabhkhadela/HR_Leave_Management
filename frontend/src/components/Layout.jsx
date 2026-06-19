import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'MANAGER';

  const employeeLinks = [
    { to: '/employee', icon: '📊', label: 'Dashboard' },
    { to: '/employee/balance', icon: '📋', label: 'Leave Balance' },
    { to: '/employee/apply', icon: '✏️', label: 'Apply Leave' },
    { to: '/employee/requests', icon: '📁', label: 'My Requests' },
  ];

  const managerLinks = [
    { to: '/manager', icon: '📊', label: 'Dashboard' },
    { to: '/manager/requests', icon: '📋', label: 'All Requests' },
    { to: '/manager/balances', icon: '👥', label: 'Employee Balances' },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🏢</span>
            <span className="logo-text">HR Leave</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/employee' || link.to === '/manager'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username}
              </span>
              <span className={`role-badge role-badge--${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} id="logout-button">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
