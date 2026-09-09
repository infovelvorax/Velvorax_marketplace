import './AdminLoginModal.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api/auth.service';
import { BrandLogo } from '../common/BrandLogo';
import { cn } from '../../utils';

export function AdminLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  
  // STAGES: 'PIN' | 'CREDENTIALS'
  const [stage, setStage] = useState('PIN');

  // Stage 1: PIN State
  const [pin, setPin] = useState('');
  const [isPinShaking, setIsPinShaking] = useState(false);

  // Stage 2: Credentials State
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const usernameInputRef = useRef(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStage('PIN');
      setPin('');
      setCredentials({ username: '', password: '' });
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
  // STAGE 2: VERIFY CREDENTIALS & DIRECT AUTHENTICATION
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

      const user = await adminLogin({
        username: trimmedUser,
        password: trimmedPass
      });

      if (user) {
        setSuccessMsg('Authentication successful! Access granted. Opening dashboard...');
        setTimeout(() => {
          onClose();
          navigate('/admin/dashboard', { replace: true });
        }, 350);
      } else {
        throw new Error('Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err?.message || 'Invalid administrator credentials. Please check your username/email and password.');
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
                <span>Step 1 of 2: Security Clearance PIN</span>
              </span>
            )}

            {stage === 'CREDENTIALS' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5">
                <span className="text-emerald-400">✓ PIN Verified</span>
                <span>• Step 2 of 2: Master Credentials</span>
              </span>
            )}

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              {stage === 'PIN' ? 'SECRET ADMIN ACCESS' : 'ADMINISTRATOR LOGIN'}
            </h2>

            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {stage === 'PIN' 
                ? 'Enter Master Clearance PIN to unlock admin console' 
                : 'Enter your username/email and password to enter dashboard'}
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
                {loading ? 'Verifying PIN...' : 'Verify PIN & Continue'}
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
        {/* STAGE 2: ADMINISTRATOR CREDENTIALS (DIRECT LOGIN)            */}
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
                placeholder="velvorax_admin or info.velvorax@gmail.com"
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
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In & Enter Admin Dashboard 🚀'}
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

      </div>
    </div>
  );
}

export default AdminLoginModal;
