import './ResetPassword.css';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '../../components';
import { authService } from '../../services/api/auth.service';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../constants';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!password) errs.password = 'New password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (password.length > 128) errs.password = 'Password cannot exceed 128 characters';

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      showToast('error', 'Reset token is missing or invalid');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, password });
      showToast('success', 'Your password has been updated! You can now sign in.');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] p-8 sm:p-12 rounded-3xl border border-[var(--border-primary)] shadow-md animate-scale-in text-[var(--text-primary)]">
      <div className="text-left mb-8">
        <h2 className="text-3xl sm:text-[32px] font-black text-[var(--text-primary)] tracking-tight mb-2">
          Set new password
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Enter your new password below to secure your Velvorax account.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            maxLength={128}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            placeholder="••••••••••••"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[44px] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] select-none cursor-pointer"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          maxLength={128}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
          placeholder="••••••••••••"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          className="w-full text-[16px] rounded-xl shadow-xs mt-2" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </Button>

        <div className="text-center pt-2">
          <Link 
            to={ROUTES.AUTH.LOGIN} 
            className="text-[15px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
