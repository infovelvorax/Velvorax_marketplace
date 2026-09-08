import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';

export function DashboardOverview() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      const role = (user.role || 'BUYER').toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/buyer/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader size="lg" />
        <span className="text-xs font-bold text-[var(--text-secondary)]">Redirecting to your dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  const role = (user.role || 'BUYER').toUpperCase();
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (role === 'SELLER') {
    return <Navigate to="/seller/dashboard" replace />;
  }
  return <Navigate to="/buyer/dashboard" replace />;
}

export default DashboardOverview;

