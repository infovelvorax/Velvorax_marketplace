import './NotFound.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { Button } from '../../components';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-[var(--text-primary)]">
      <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--bg-surface)] px-4 py-1.5 rounded-full border border-[var(--border-primary)] shadow-xs">404 Error</p>
      <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
        Page Not Found
      </h1>
      <p className="mt-3 text-base text-[var(--text-secondary)] max-w-md">
        The marketplace page or listing you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8">
        <Link to={ROUTES.HOME}>
          <Button variant="primary" className="bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold border border-[var(--button-primary)]">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
