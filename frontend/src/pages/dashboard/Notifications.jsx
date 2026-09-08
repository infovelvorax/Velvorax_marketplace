import './Notifications.css';
import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/api/notification.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { BackButton } from '../../components/common/BackButton';
import { cn } from '../../utils';

export const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      const items = Array.isArray(data) ? data : (data?.data || []);
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to load notifications at this time.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await notificationService.markAsRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
      showToast('success', 'All notifications marked as read');
    } catch (e) {
      showToast('error', 'Failed to mark notifications');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OFFER': return '🤝';
      case 'MESSAGE': return '💬';
      case 'JOB_APPLICATION': return '💼';
      case 'SERVICE_BOOKING': return '📅';
      case 'LISTING_APPROVED': return '✅';
      case 'LISTING_REJECTED': return '❌';
      case 'ORDER': return '💳';
      case 'PURCHASE': return '🛍️';
      case 'SYSTEM': return '⚙️';
      default: return '🔔';
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const hasUnread = safeNotifications.some(n => n && !n.isRead);

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="mb-2">
            <BackButton fallbackUrl="/" label="Back" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Notifications</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1">Real-time alerts, offers, applications, and updates.</p>
        </div>

        {hasUnread && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[13px] font-bold text-[var(--text-secondary)] rounded-xl border border-[var(--border-primary)] transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : error ? (
        <div className="p-10 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Could not load notifications</h3>
          <p className="text-[14px] text-[var(--text-secondary)] mb-4">{error}</p>
          <button 
            onClick={fetchNotifications} 
            className="px-5 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] text-xs font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : safeNotifications.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">No notifications</h3>
          <p className="text-[15px] text-[var(--text-secondary)]">You are completely up to date.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden divide-y divide-[var(--border-subtle)] shadow-xs">
          {safeNotifications.map(n => (
            <div 
              key={n._id || Math.random()}
              className={cn(
                "p-6 flex items-start gap-4 transition-colors",
                !n.isRead ? "bg-[var(--bg-secondary)]/80" : "hover:bg-[var(--bg-secondary)]"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] flex items-center justify-center text-xl shrink-0 shadow-xs">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={cn("text-[15px] font-bold truncate", !n.isRead ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-medium">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                
                {!n.isRead && (
                  <button 
                    onClick={() => markAsRead(n._id)}
                    className="mt-2 text-[12px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

