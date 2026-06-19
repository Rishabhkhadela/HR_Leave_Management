import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes by auth status and optional role.
 * @param {string} role - If provided, only users with this role can access.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their own dashboard if they try to access wrong role's pages
    const redirect = user.role === 'MANAGER' ? '/manager' : '/employee';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
