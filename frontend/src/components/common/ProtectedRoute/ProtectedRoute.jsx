import './ProtectedRoute.css';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <span className="text-xs font-bold text-[var(--text-secondary)]">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const isSellerPath = location.pathname.startsWith('/seller');
    const isAdminPath = location.pathname.startsWith('/admin');
    
    if (isAdminPath) {
      return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
    }
    if (isSellerPath) {
      return <Navigate to={`${ROUTES.AUTH.LOGIN}?role=SELLER`} state={{ from: location }} replace />;
    }
    return <Navigate to={`${ROUTES.AUTH.LOGIN}?role=BUYER`} state={{ from: location }} replace />;
  }

  // Check role authorization if specific roles are required
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = (user.role || 'BUYER').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    // Normalize BUYER and USER as compatible
    const isAuthorized = normalizedAllowed.includes(userRole) || 
      (normalizedAllowed.includes('BUYER') && userRole === 'USER') ||
      (normalizedAllowed.includes('USER') && userRole === 'BUYER');

    if (!isAuthorized) {
      // Redirect strictly to their own role dashboard
      let fallbackRoute = '/buyer/dashboard';
      if (userRole === 'ADMIN') fallbackRoute = '/admin/dashboard';
      if (userRole === 'SELLER') fallbackRoute = '/seller/dashboard';

      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
