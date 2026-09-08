import './VerifyOTP.css';
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input, Button } from '../../components';
import { authService } from '../../services/api/auth.service';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../constants';

export const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const urlEmail = searchParams.get('email') || '';
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!code || code.length < 6) {
      setError('A valid 6-digit verification code is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.verifyOTP(email, code);
      showToast('success', res.message || 'Code verified successfully!');
      if (res?.data?.resetToken) {
        navigate(`${ROUTES.AUTH.RESET_PASSWORD}?token=${res.data.resetToken}&email=${encodeURIComponent(email)}`);
      } else {
        navigate(ROUTES.AUTH.LOGIN);
      }
    } catch (err) {
      showToast('error', err.message || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] p-8 sm:p-12 rounded-3xl border border-[var(--border-primary)] shadow-md animate-scale-in text-[var(--text-primary)]">
      <div className="text-left mb-8">
        <h2 className="text-3xl sm:text-[32px] font-black text-[var(--text-primary)] tracking-tight mb-2">
          Verify security code
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Enter the 6-digit verification code sent to your registered email address.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {!urlEmail && (
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        )}

        <Input
          label="6-Digit Verification Code"
          name="code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
            if (error) setError('');
          }}
          error={error}
          placeholder="123456"
          inputClassName="text-center text-3xl tracking-[0.35em] font-black text-[var(--text-primary)]"
        />

        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          className="w-full text-[16px] rounded-xl shadow-xs" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
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

export default VerifyOTP;
