import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';

// Public pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import CompaniesPage from './pages/CompaniesPage';
import NotFoundPage from './pages/NotFoundPage';

// Student pages
import DashboardPage from './pages/student/DashboardPage';
import CompanyTrackPage from './pages/student/CompanyTrackPage';
import PracticePage from './pages/student/PracticePage';
import CodingPlatformPage from './pages/student/CodingPlatformPage';
import CodingProblemPage from './pages/student/CodingProblemPage';
import MockTestPage from './pages/student/MockTestPage';
import MockTestResultPage from './pages/student/MockTestResultPage';
import AnalyticsPage from './pages/student/AnalyticsPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import AICoachPage from './pages/student/AICoachPage';
import NotesPage from './pages/student/NotesPage';
import ProfilePage from './pages/student/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCoding from './pages/admin/AdminCoding';
import AdminTests from './pages/admin/AdminTests';
import AdminNotes from './pages/admin/AdminNotes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';

// Layout
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    const home = (user?.role === 'admin' || user?.role === 'superadmin') ? '/admin' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return children;
};

const PublicOnly = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (isAuthenticated) {
    if (user?.role === 'admin' || user?.role === 'superadmin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Auth */}
        <Route path="/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/signup"          element={<PublicOnly><SignupPage /></PublicOnly>} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
        <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token"    element={<VerifyEmailPage />} />
        <Route path="/oauth-callback"         element={<OAuthCallbackPage />} />

        {/* Student */}
        <Route path="/" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route path="dashboard"              element={<DashboardPage />} />
          <Route path="company/:slug"          element={<CompanyTrackPage />} />
          <Route path="practice"              element={<PracticePage />} />
          <Route path="coding"                element={<CodingPlatformPage />} />
          <Route path="coding/:slug"          element={<CodingProblemPage />} />
          <Route path="tests"                 element={<MockTestPage />} />
          <Route path="tests/:id/result"      element={<MockTestResultPage />} />
          <Route path="analytics"             element={<AnalyticsPage />} />
          <Route path="leaderboard"           element={<LeaderboardPage />} />
          <Route path="ai-coach"              element={<AICoachPage />} />
          <Route path="notes"                 element={<NotesPage />} />
          <Route path="profile"               element={<ProfilePage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin','superadmin']}><AdminLayout /></ProtectedRoute>}>
          <Route index                        element={<AdminDashboard />} />
          <Route path="companies"             element={<AdminCompanies />} />
          <Route path="questions"             element={<AdminQuestions />} />
          <Route path="coding"                element={<AdminCoding />} />
          <Route path="tests"                 element={<AdminTests />} />
          <Route path="notes"                 element={<AdminNotes />} />
          <Route path="users"                 element={<AdminUsers />} />
          <Route path="payments"              element={<AdminPayments />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
