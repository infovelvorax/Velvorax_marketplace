import './ChangePassword.css';
import React, { useState } from 'react';
import { Card, Input, Button } from '../../components';
import { BackButton } from '../../components/common/BackButton';
import { useToast } from '../../hooks/useToast';
import { dashboardService } from '../../services/api/dashboard.service';

export const ChangePassword = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword = 'New password cannot exceed 128 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
      const response = await dashboardService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      showToast('success', response?.message || 'Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Failed to change password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8 text-[var(--text-primary)]">
      <div>
        <div className="mb-3">
          <BackButton fallbackUrl="/" label="Back" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Change Password</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-1">Update your security credentials to protect your account.</p>
      </div>
      
      <Card className="p-7 sm:p-10 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            placeholder="••••••••"
          />
          
          <div className="pt-2">
            <Input
              label="New Password (8-128 Characters)"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              maxLength={128}
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              placeholder="••••••••"
            />
          </div>
          
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            maxLength={128}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold border border-[var(--button-primary)] px-6 py-3 rounded-xl cursor-pointer"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
