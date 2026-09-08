import './Unauthorized.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import { ROUTES } from '../../constants';

export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-[var(--text-primary)]">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
        Access Restricted
      </h1>
      <p className="mt-3 text-base text-[var(--text-secondary)] max-w-md mb-8">
        You do not have permission to view this page. Please log in with an account that has the appropriate access rights.
      </p>
      <div className="flex gap-4">
        <Button as={Link} to={ROUTES.HOME} variant="outline">
          Back to Home
        </Button>
        <Button as={Link} to={ROUTES.AUTH.LOGIN} className="bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold border border-[var(--button-primary)]">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
