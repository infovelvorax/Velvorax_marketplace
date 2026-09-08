import './GuestRoute.css';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants';

export const GuestRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const role = (user.role || 'BUYER').toUpperCase();
    const target = role === 'ADMIN' ? '/admin' : role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard';
    return <Navigate to={target} replace />;
  }

  return children;
};
