import './ForgotPassword.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '../../components';
import { authService } from '../../services/api/auth.service';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../constants';

export const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step State (1 = Email, 2 = Verify OTP, 3 = Reset Password)
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Timers
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If token is provided in URL, jump directly to step 3
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setResetToken(urlToken);
      setStep(3);
    }
  }, [searchParams]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(cleanEmail);
      showToast('success', response?.message || 'OTP sent to your email address. Please check your inbox.');
      setStep(2);
      setResendCooldown(45); // 45 seconds cooldown for resend
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await authService.verifyOTP(email.trim(), cleanOtp);
      showToast('success', 'Verification code confirmed successfully!');
      if (response?.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep(3);
      } else {
        showToast('error', 'Session error. Please request a new code.');
        setStep(1);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      showToast('success', response?.message || 'A new verification code has been sent to your email.');
      setResendCooldown(45);
      setOtp('');
      setErrors({});
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to resend verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const formErrors = {};
    if (!newPassword) {
      formErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      formErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (newPassword.length > 128) {
      formErrors.newPassword = 'Password cannot exceed 128 characters';
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = 'Confirmation password is required';
    } else if (newPassword !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword({
        token: resetToken,
        password: newPassword
      });
      showToast('success', response?.message || 'Password reset successfully! You can now sign in.');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to update password. Your reset session may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] p-8 sm:p-12 rounded-3xl border border-[var(--border-primary)] shadow-md animate-scale-in text-[var(--text-primary)] transition-colors duration-200">
      
      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step >= 1 ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              1
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hidden xs:inline">Email</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-[var(--button-primary)]' : 'bg-[var(--border-primary)]'}`} />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step >= 2 ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              2
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hidden xs:inline">Verify OTP</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-[var(--button-primary)]' : 'bg-[var(--border-primary)]'}`} />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step >= 3 ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              3
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hidden xs:inline">New Password</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: Enter Email */}
      {/* ============================================================ */}
      {step === 1 && (
        <>
          <div className="text-left mb-8">
            <h2 className="text-3xl sm:text-[32px] font-black text-[var(--text-primary)] tracking-tight mb-2">
              Forgot Password
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)]">
              Enter your registered email address. We will send a secure 6-digit verification code directly to your email inbox.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSendOtp}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              placeholder="name@company.com"
              leftIcon={
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              className="w-full text-[16px] rounded-xl shadow-xs cursor-pointer font-bold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
            </Button>

            <div className="text-center pt-2">
              <Link 
                to={ROUTES.AUTH.LOGIN} 
                className="text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        </>
      )}

      {/* ============================================================ */}
      {/* STEP 2: OTP Verification */}
      {/* ============================================================ */}
      {step === 2 && (
        <>
          <div className="text-left mb-8">
            <h2 className="text-3xl sm:text-[32px] font-black text-[var(--text-primary)] tracking-tight mb-2">
              Check Your Email Inbox
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
              We have sent a 6-digit security code to <strong className="text-[var(--text-primary)]">{email}</strong>. Please enter the code below to verify your identity.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl mb-6 flex items-start gap-3">
            <span className="text-xl">📩</span>
            <div className="text-[13px] text-[var(--text-secondary)] leading-snug">
              <strong className="text-[var(--text-primary)] block mb-0.5">OTP sent to your email address</strong>
              Check your inbox and spam folder. The code will expire in 10 minutes.
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <Input
                label="6-Digit Verification Code"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setOtp(val);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                error={errors.otp}
                placeholder="••••••"
                inputClassName="text-center text-3xl tracking-[0.4em] font-black text-[var(--text-primary)] placeholder:text-2xl placeholder:tracking-normal"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              className="w-full text-[16px] rounded-xl shadow-xs cursor-pointer font-bold" 
              disabled={isSubmitting || otp.length < 6}
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP & Continue'}
            </Button>

            {/* Resend OTP Section */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[13px]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isSubmitting}
                onClick={handleResendOtp}
                className={`font-bold transition-colors cursor-pointer ${
                  resendCooldown > 0
                    ? 'text-[var(--text-muted)] cursor-not-allowed'
                    : 'text-[var(--accent)] hover:underline'
                }`}
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend OTP Code'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link 
                to={ROUTES.AUTH.LOGIN} 
                className="text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        </>
      )}

      {/* ============================================================ */}
      {/* STEP 3: Reset Password */}
      {/* ============================================================ */}
      {step === 3 && (
        <>
          <div className="text-left mb-8">
            <h2 className="text-3xl sm:text-[32px] font-black text-[var(--text-primary)] tracking-tight mb-2">
              Set New Password
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)]">
              Create a strong password of at least 8 characters for your Velvorax account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div className="relative">
              <Input
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={128}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                error={errors.newPassword}
                placeholder="••••••••••••"
                leftIcon={
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              autoComplete="new-password"
              maxLength={128}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={errors.confirmPassword}
              placeholder="••••••••••••"
              leftIcon={
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              className="w-full text-[16px] rounded-xl shadow-xs cursor-pointer font-bold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password & Sign In'}
            </Button>

            <div className="text-center pt-2">
              <Link 
                to={ROUTES.AUTH.LOGIN} 
                className="text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        </>
      )}

    </div>
  );
};

export default ForgotPassword;
