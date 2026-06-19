import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import LeaveBalance from './pages/employee/LeaveBalance';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyRequests from './pages/employee/MyRequests';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AllRequests from './pages/manager/AllRequests';
import EmployeeBalances from './pages/manager/EmployeeBalances';

import './App.css';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'MANAGER'
    ? <Navigate to="/manager" replace />
    : <Navigate to="/employee" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Employee routes */}
          <Route
            element={
              <ProtectedRoute role="EMPLOYEE">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/balance" element={<LeaveBalance />} />
            <Route path="/employee/apply" element={<ApplyLeave />} />
            <Route path="/employee/requests" element={<MyRequests />} />
          </Route>

          {/* Manager routes */}
          <Route
            element={
              <ProtectedRoute role="MANAGER">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/requests" element={<AllRequests />} />
            <Route path="/manager/balances" element={<EmployeeBalances />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
