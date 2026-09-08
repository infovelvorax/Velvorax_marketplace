import './AdminLoginModal.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api/auth.service';
import { BrandLogo } from '../common/BrandLogo';
import { cn } from '../../utils';

export function AdminLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { verifyAdmin2FA, adminLogin } = useAuth();
  
  // STAGES: 'PIN' | 'CREDENTIALS' | '2FA'
  const [stage, setStage] = useState('PIN');

  // Stage 1: PIN State
  const [pin, setPin] = useState('');
  const [isPinShaking, setIsPinShaking] = useState(false);

  // Stage 2: Credentials State
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Stage 3: 2FA State
  const [twoFactorSession, setTwoFactorSession] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const usernameInputRef = useRef(null);
  const otpRefs = useRef([]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStage('PIN');
      setPin('');
      setCredentials({ username: '', password: '' });
      setOtpDigits(['', '', '', '', '', '']);
      setTwoFactorSession(null);
      setError('');
      setSuccessMsg('');
      setShowPassword(false);
      setLoading(false);
      setIsPinShaking(false);
    }
  }, [isOpen]);

  // Handle global keyboard shortcuts & PIN typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // If in PIN stage, allow direct numeric typing from keyboard
      if (stage === 'PIN' && !loading) {
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          setPin(prev => (prev.length < 6 ? prev + e.key : prev));
          setError('');
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setPin(prev => prev.slice(0, -1));
          setError('');
        } else if (e.key === 'Enter' && pin.length >= 4) {
          e.preventDefault();
          handleVerifyPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stage, pin, loading, onClose]);

  // Auto-verify when 6 digits are typed in PIN stage
  useEffect(() => {
    if (stage === 'PIN' && pin.length === 6 && !loading) {
      handleVerifyPin(pin);
    }
  }, [pin, stage]);

  // Countdown timer for 2FA resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // STAGE 1: VERIFY PIN
  // -------------------------------------------------------------
  const handleVerifyPin = async (pinToVerify) => {
    const currentPin = (pinToVerify || pin).trim();
    if (currentPin.length < 4) {
      setError('Please enter the security access PIN.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.verifyAdminPin(currentPin);
      if (res && res.success) {
        setSuccessMsg('Security clearance verified.');
        setTimeout(() => {
          setSuccessMsg('');
          setStage('CREDENTIALS');
          setLoading(false);
          setTimeout(() => usernameInputRef.current?.focus(), 100);
        }, 300);
        return;
      }
      throw new Error(res?.message || 'Access Denied: Invalid Security Clearance PIN.');
    } catch (err) {
      setError(err?.message || 'Access Denied: Invalid Security Clearance PIN.');
      triggerShake();
      setPin('');
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setIsPinShaking(true);
    setTimeout(() => setIsPinShaking(false), 450);
  };

  const handleKeypadPress = (val) => {
    if (loading) return;
    setError('');
    if (val === 'CLEAR') {
      setPin('');
    } else if (val === 'BACKSPACE') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
    }
  };

  // -------------------------------------------------------------
  // STAGE 2: VERIFY CREDENTIALS & INITIATE 2FA
  // -------------------------------------------------------------
  const handleCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!credentials.username.trim() || !credentials.password) {
      setError('Please enter administrator credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const trimmedUser = credentials.username.trim();
      const trimmedPass = credentials.password;

      const initRes = await authService.initiateAdminLogin({
        username: trimmedUser,
        password: trimmedPass
      });

      if (initRes && initRes.success) {
        setTwoFactorSession({
          tempSessionId: initRes.tempSessionId,
          targetEmail: initRes.targetEmail || 'rarajuvagga@velvorax.tech'
        });
        setStage('2FA');
        setResendCooldown(45);
        setSuccessMsg('Verification code sent to rarajuvagga@velvorax.tech');
        setTimeout(() => setSuccessMsg(''), 4000);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        throw new Error(initRes?.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 3: VERIFY 2FA OTP
  // -------------------------------------------------------------
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val) {
      const newOtp = [...otpDigits];
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    const newOtp = [...otpDigits];
    if (val.length > 1) {
      const chars = val.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (index + i < 6) newOtp[index + i] = c;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      otpRefs.current[nextIndex]?.focus();
      
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        handleVerify2FACode(fullCode);
      }
      return;
    }

    newOtp[index] = val;
    setOtpDigits(newOtp);

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerify2FACode(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FACode = async (codeToVerify) => {
    const fullCode = (codeToVerify || otpDigits.join('')).trim();
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the 2FA security code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await verifyAdmin2FA({
        tempSessionId: twoFactorSession?.tempSessionId,
        code: fullCode
      });

      if (!userData) {
        throw new Error('Invalid or expired 2FA verification code.');
      }

      setSuccessMsg('Security verified! Access granted. Opening dashboard...');
      setTimeout(() => {
        onClose();
        navigate('/admin/dashboard', { replace: true });
      }, 400);
    } catch (err) {
      setError(err?.message || 'Invalid or expired 2FA code. Please check your email and try again.');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      if (twoFactorSession?.tempSessionId) {
        await authService.resendAdmin2FA({
          tempSessionId: twoFactorSession.tempSessionId
        });
      }
      setResendCooldown(45);
      setSuccessMsg('A new 2FA code has been dispatched to rarajuvagga@velvorax.tech');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to resend security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto admin-modal-backdrop">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 transition-opacity duration-300"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        className={cn(
          "relative w-full max-w-md admin-glass-card border border-indigo-500/30 rounded-3xl overflow-hidden z-10 transition-all transform duration-300 p-6 sm:p-9 text-[var(--text-primary)] shadow-2xl",
          isPinShaking && "shake-animation"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Glowing Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 shadow-sm" />

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
            <BrandLogo height={32} className="h-8 w-auto" />
          </div>

          <div className="pt-1">
            {stage === 'PIN' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Level 1 Security Gateway</span>
              </span>
            )}

            {stage === 'CREDENTIALS' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5">
                <span className="text-emerald-400">✓ PIN Verified</span>
                <span>• Level 2 Credentials</span>
              </span>
            )}

            {stage === '2FA' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Level 3 Two-Factor Authentication</span>
              </span>
            )}

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              {stage === 'PIN' && 'SECRET ADMIN ACCESS'}
              {stage === 'CREDENTIALS' && 'ADMINISTRATOR LOGIN'}
              {stage === '2FA' && '2FA VERIFICATION'}
            </h2>

            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {stage === 'PIN' && 'Enter Master Clearance PIN to unlock admin console'}
              {stage === 'CREDENTIALS' && 'Enter your authorized master login credentials'}
              {stage === '2FA' && 'Verify 6-digit security code for authorization'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-400 animate-fadeIn">
            <span className="text-base shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs font-bold text-emerald-400 animate-fadeIn">
            <span className="text-base shrink-0">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 1: PIN VERIFICATION                                    */}
        {/* ============================================================ */}
        {stage === 'PIN' && (
          <div className="space-y-5">
            {/* PIN Display Dots */}
            <div className="flex justify-center items-center gap-2.5 sm:gap-3 py-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-10 h-12 sm:w-11 sm:h-13 rounded-xl border flex items-center justify-center text-lg font-black transition-all pin-digit-box",
                      isFilled 
                        ? "filled border-indigo-500 text-indigo-400" 
                        : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    )}
                  >
                    {isFilled ? '●' : '—'}
                  </div>
                );
              })}
            </div>

            {/* Virtual Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(String(num))}
                  className="h-12 rounded-xl pin-keypad-btn text-base font-bold flex items-center justify-center cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('CLEAR')}
                className="h-12 rounded-xl pin-keypad-btn text-xs font-bold text-rose-400 flex items-center justify-center cursor-pointer select-none"
                title="Clear All"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 rounded-xl pin-keypad-btn text-base font-bold flex items-center justify-center cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('BACKSPACE')}
                className="h-12 rounded-xl pin-keypad-btn text-base font-bold text-amber-400 flex items-center justify-center cursor-pointer select-none"
                title="Backspace"
              >
                ⌫
              </button>
            </div>

            {/* Verify PIN Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={loading || pin.length < 4}
                onClick={() => handleVerifyPin(pin)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying PIN...' : 'Verify PIN'}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: ADMINISTRATOR CREDENTIALS                           */}
        {/* ============================================================ */}
        {stage === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} autoComplete="off" className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Administrator Username or Email
              </label>
              <input
                ref={usernameInputRef}
                type="text"
                name="admin-username"
                autoComplete="off"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => {
                  setCredentials(prev => ({ ...prev, username: e.target.value }));
                  if (error) setError('');
                }}
                disabled={loading}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin-password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  maxLength={128}
                  value={credentials.password}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, password: e.target.value }));
                    if (error) setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 pr-10"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">
                  🔒
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading || !credentials.username.trim() || !credentials.password}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Proceed to Two-Factor Auth (2FA) &rarr;'}
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage('PIN');
                    setPin('');
                    setError('');
                  }}
                  disabled={loading}
                  className="py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  &larr; Re-enter PIN
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: TWO-FACTOR AUTHENTICATION (2FA)                     */}
        {/* ============================================================ */}
        {stage === '2FA' && (
          <div className="space-y-4">
            {/* Live Security Dispatch Banner */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>2FA Security Code Dispatched</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/25">
                  10-MIN VALID
                </span>
              </div>
              
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1.5">
                <p>
                  A 6-digit verification code has been dispatched to the designated administrator email:
                </p>
                <div className="font-mono font-bold text-indigo-300 bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-500/20 text-center tracking-wide">
                  rarajuvagga@velvorax.tech
                </div>
                <p className="text-[11px] text-[var(--text-muted)] text-center pt-0.5">
                  Please check your inbox or spam folder and enter the code below.
                </p>
              </div>
            </div>

            {/* 6 OTP Boxes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    className="w-10 h-12 sm:w-11 sm:h-13 bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-emerald-500 rounded-xl text-center text-lg font-black text-[var(--text-primary)] focus:outline-none transition-all shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Resend & Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                disabled={loading || otpDigits.join('').length !== 6}
                onClick={() => handleVerify2FACode()}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying 2FA Code...' : 'Complete Authentication & Enter Dashboard 🚀'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResend2FA}
                  className="font-bold text-indigo-400 hover:text-indigo-300 disabled:text-[var(--text-muted)] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend 2FA Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStage('CREDENTIALS');
                    setError('');
                  }}
                  disabled={loading}
                  className="font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  &larr; Back to Login
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminLoginModal;
