import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Component to protect routes based on user roles
 * @param {Array} allowedRoles - Array of roles that can access this route
 * @param {ReactNode} children - Child components to render if authorized
 */
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user?.role)) {
    toast.error('Танд энэ хуудас руу хандах эрх байхгүй байна');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
