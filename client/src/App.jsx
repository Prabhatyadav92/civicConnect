import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import NewReport from './pages/NewReport.jsx';
import MyReports from './pages/MyReports.jsx';
import ReportDetail from './pages/ReportDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';

const homeFor = (user) => (user.role === 'citizen' ? '/reports' : '/dashboard');

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-steel">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><AuthPage key="login" mode="login" /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><AuthPage key="register" mode="register" /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/reports" element={<Protected roles={['citizen']}><MyReports /></Protected>} />
        <Route path="/reports/new" element={<Protected roles={['citizen']}><NewReport /></Protected>} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/dashboard" element={<Protected roles={['official', 'admin']}><Dashboard /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  );
}