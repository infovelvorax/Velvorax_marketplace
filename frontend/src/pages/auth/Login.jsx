import './Login.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Input, Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../constants';
import { 
  MARKETPLACE_CATEGORIES, 
  DEFAULT_MARKETPLACE_CATEGORY, 
  getCategoryById, 
  normalizeCategoryId, 
  getCategoryDashboardRoute 
} from '../../constants/categories';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // URL Query Parameters support: ?role=SELLER&category=properties
  const urlRole = (searchParams.get('role') || '').toUpperCase();
  const urlCategory = (searchParams.get('category') || '').toLowerCase();

  const [role, setRole] = useState(urlRole === 'SELLER' ? 'SELLER' : 'BUYER');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (urlCategory && MARKETPLACE_CATEGORIES.some(c => c.id === urlCategory || c.slug === urlCategory)) {
      return normalizeCategoryId(urlCategory);
    }
    return DEFAULT_MARKETPLACE_CATEGORY;
  });

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always reset fields to completely empty on component mount
  useEffect(() => {
    setFormData({ email: '', password: '' });
    setErrors({});
    setShowPassword(false);
  }, []);

  // Sync role/category if URL query params change
  useEffect(() => {
    if (urlRole === 'SELLER' || urlRole === 'BUYER') {
      setRole(urlRole);
    }
    if (urlCategory && MARKETPLACE_CATEGORIES.some(c => c.id === urlCategory || c.slug === urlCategory)) {
      setSelectedCategory(normalizeCategoryId(urlCategory));
    }
  }, [urlRole, urlCategory]);

  const activeCategoryMeta = getCategoryById(selectedCategory);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email address or username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
        expectedRole: role,
        category: selectedCategory
      });

      // Clear credentials immediately from state
      setFormData({ email: '', password: '' });
      setErrors({});
      setShowPassword(false);

      const label = user.role === 'SELLER' 
        ? `${activeCategoryMeta.shortName} Seller`
        : 'Buyer';

      showToast('success', `Welcome back, ${user.name || 'User'}! Signed in as ${label}.`);

      // Determine redirect destination
      let targetPath = location.state?.from?.pathname;
      if (!targetPath || targetPath.startsWith('/auth') || targetPath.startsWith('/login') || targetPath.startsWith('/register')) {
        if (user.role === 'SELLER') {
          targetPath = getCategoryDashboardRoute(selectedCategory);
        } else {
          targetPath = '/';
        }
      }

      navigate(targetPath, { replace: true });
    } catch (error) {
      showToast('error', error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[var(--bg-surface)] p-6 sm:p-9 rounded-3xl border border-[var(--border-primary)] shadow-xl animate-scale-in text-[var(--text-primary)]">
      
      {/* Header */}
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Sign in to access your Velvorax marketplace account.
        </p>
      </div>

      {/* Clean Role Toggle Pills */}
      <div className="mb-5">
        <div className="grid grid-cols-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'BUYER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🛍️</span>
            <span>Buyer Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'SELLER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>📦</span>
            <span>Seller Sign In</span>
          </button>
        </div>
      </div>

      {/* Compact Sector Dropdown (When Seller is selected) */}
      {role === 'SELLER' && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0 flex items-center gap-1.5">
              <span>{activeCategoryMeta.icon}</span>
              <span>Active Sector / Category:</span>
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
            >
              {MARKETPLACE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <span className="text-emerald-500">✓</span>
            <span>One Account: Sign in to any category with your email & password.</span>
          </div>
        </div>
      )}

      {/* Main Login Form Inputs */}
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        
        {/* Email / Username Field */}
        <Input
          label="Email Address or Username"
          name="email"
          type="text"
          autoComplete="off"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="name@example.com"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />

        {/* Password Field with Show/Hide */}
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            maxLength={128}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••••••"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[42px] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer select-none"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer select-none font-medium">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--border-primary)] text-[var(--button-primary)] focus:ring-[var(--button-primary)] accent-[var(--button-primary)]"
            />
            <span>Remember me</span>
          </label>

          <Link 
            to={ROUTES.AUTH.FORGOT_PASSWORD} 
            className="font-bold text-[var(--accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          className="w-full text-sm sm:text-base font-bold rounded-xl shadow-md py-3.5 mt-1" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Verifying...' 
            : role === 'SELLER'
              ? `Sign In as ${activeCategoryMeta.shortName}`
              : 'Sign In as Buyer'}
        </Button>

        {/* Bottom Switch to Register */}
        <div className="pt-3 text-center text-xs sm:text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
          Don't have an account?{' '}
          <Link 
            to={`${ROUTES.AUTH.REGISTER}?role=${role}${role === 'SELLER' ? `&category=${selectedCategory}` : ''}`} 
            className="font-bold text-[var(--accent)] hover:underline"
          >
            Create an Account &rarr;
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
