import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import PickupRequestsPage from './pages/pickup/PickupRequestsPage';
import PickupHistoryPage from './pages/pickup/PickupHistoryPage';
import CreatePickupRequestPage from './pages/pickup/CreatePickupRequestPage';
import MyChildrenPage from './pages/parent/MyChildrenPage';
import MyRequestsPage from './pages/parent/MyRequestsPage';
import NotificationPreferencesPage from './pages/parent/NotificationPreferencesPage';
import ReportsPage from './pages/reports/ReportsPage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';

// Guard Pages
import VerificationPage from './pages/guard/VerificationPage';
import QueuePage from './pages/guard/QueuePage';
import EmergencyPickupPage from './pages/guard/EmergencyPickupPage';

// Teacher Pages
import MyClassPage from './pages/teacher/MyClassPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Admin only routes */}
        <Route
          path="admin/users"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <StudentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="students/:id"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <StudentDetailPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </RoleProtectedRoute>
          }
        />

        {/* Teacher and Admin routes */}
        <Route
          path="my-class"
          element={
            <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
              <MyClassPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="pickup-requests"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'guard']}>
              <PickupRequestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="pickup-history"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'parent', 'guard']}>
              <PickupHistoryPage />
            </RoleProtectedRoute>
          }
        />

        {/* Parent routes */}
        <Route
          path="pickup/create"
          element={
            <RoleProtectedRoute allowedRoles={['parent']}>
              <CreatePickupRequestPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="pickup/requests"
          element={
            <RoleProtectedRoute allowedRoles={['parent']}>
              <MyRequestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="my-children"
          element={
            <RoleProtectedRoute allowedRoles={['parent']}>
              <MyChildrenPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="notifications/preferences"
          element={
            <RoleProtectedRoute allowedRoles={['parent', 'teacher', 'admin']}>
              <NotificationPreferencesPage />
            </RoleProtectedRoute>
          }
        />

        {/* Guard routes */}
        <Route
          path="guard/verify"
          element={
            <RoleProtectedRoute allowedRoles={['guard', 'admin']}>
              <VerificationPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="guard/queue"
          element={
            <RoleProtectedRoute allowedRoles={['guard', 'admin']}>
              <QueuePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="guard/emergency"
          element={
            <RoleProtectedRoute allowedRoles={['guard', 'admin']}>
              <EmergencyPickupPage />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
