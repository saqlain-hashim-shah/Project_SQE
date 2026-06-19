import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;