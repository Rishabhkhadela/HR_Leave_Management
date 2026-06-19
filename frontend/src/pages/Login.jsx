import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Decorative side */}
        <div className="login-hero">
          <div className="login-hero-content">
            <div className="hero-icon">🏢</div>
            <h1>HR Leave Portal</h1>
            <p>Manage your leave requests with ease. Apply, track, and stay organized.</p>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="feature-dot"></span>
                <span>Apply for leave in seconds</span>
              </div>
              <div className="hero-feature">
                <span className="feature-dot"></span>
                <span>Track request status in real-time</span>
              </div>
              <div className="hero-feature">
                <span className="feature-dot"></span>
                <span>View balance at a glance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>

            {error && (
              <div className="alert alert--error" id="login-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-sm"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="login-demo-info">
              <p className="demo-title">Demo Credentials</p>
              <div className="demo-cards">
                <button
                  type="button"
                  className="demo-card"
                  onClick={() => { setUsername('employee1'); setPassword('pass1234'); }}
                >
                  <span className="demo-role">👤 Employee</span>
                  <span className="demo-user">employee1 / pass1234</span>
                </button>
                <button
                  type="button"
                  className="demo-card"
                  onClick={() => { setUsername('manager1'); setPassword('pass1234'); }}
                >
                  <span className="demo-role">👔 Manager</span>
                  <span className="demo-user">manager1 / pass1234</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
