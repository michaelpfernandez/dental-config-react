import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredActionRight?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredActionRight }) => {
  const { isAuthenticated, hasActionRight } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific action right is required, check if user has it
  if (requiredActionRight && !hasActionRight(requiredActionRight)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required permissions
  return <Outlet />;
};

export default ProtectedRoute;
