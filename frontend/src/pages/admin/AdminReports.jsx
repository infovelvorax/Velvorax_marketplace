import React, { useState, useEffect, useCallback } from 'react';
import { reportService } from '../../services/api/report.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';

export function AdminReports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('OPEN'); // 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'ALL'
  const [processingId, setProcessingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Resolution modal state for custom notes
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    report: null,
    action: '' // 'TAKE_ACTION' | 'REMOVE_ITEM' | 'DISMISS'
  });
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getReports();
      const list = Array.isArray(data) ? data : (data?.data || data?.reports || []);
      setReports(list);
    } catch (e) {
      console.error('Failed to fetch reports:', e);
      showToast('error', e.response?.data?.message || e.message || 'Failed to load safety reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshTrigger]);

  const handleExecuteAction = async (reportId, actionType, notes = '') => {
    const lockKey = `${reportId}_${actionType}`;
    if (processingId) return; // Prevent double-clicks
    setProcessingId(lockKey);

    try {
      const payload = {
        action: actionType,
        status: actionType === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
        resolutionNotes: notes || (
          actionType === 'REMOVE_ITEM' ? 'Listing removed following moderation review' :
          actionType === 'DISMISS' ? 'Flag dismissed by administrator' :
          'Administrative action completed'
        )
      };

      const response = await reportService.resolveReport(reportId, payload);
      
      const successMsg = 
        actionType === 'REMOVE_ITEM' ? 'Listing removed and report resolved successfully.' :
        actionType === 'DISMISS' ? 'Report dismissed successfully.' :
        'Report resolved successfully.';

      showToast('success', response?.message || successMsg);

      // Close modal if open
      setActionModal({ isOpen: false, report: null, action: '' });
      setResolutionNotes('');

      // Refresh list
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error('Resolution error:', e);
      const errorMsg = e.response?.data?.message || e.message || 'Failed to resolve report';
      showToast('error', errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const openActionPrompt = (report, actionType) => {
    setActionModal({
      isOpen: true,
      report,
      action: actionType
    });
    setResolutionNotes('');
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return !r.status || r.status === 'OPEN' || r.status === 'PENDING' || r.status === 'INVESTIGATING';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED' || r.status === 'ACTION_TAKEN';
    if (filter === 'DISMISSED') return r.status === 'DISMISSED';
    return true;
  });

  const openCount = reports.filter(r => !r.status || r.status === 'OPEN' || r.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              &larr; Admin Command
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-rose-400">Trust & Safety</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <span>Incident & Safety Reports</span>
            {openCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {openCount} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Review user-reported listings, investigate policy violations, remove non-compliant items, or dismiss invalid flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
            className="px-3.5 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        {[
          { id: 'OPEN', label: 'Open Reports', count: openCount },
          { id: 'RESOLVED', label: 'Resolved / Removed' },
          { id: 'DISMISSED', label: 'Dismissed Flags' },
          { id: 'ALL', label: 'All History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === tab.id
                ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : filteredReports.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            {filter === 'OPEN' ? 'No pending reports!' : 'No reports found for this filter.'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {filter === 'OPEN' 
              ? 'All safety flags and incident reports have been reviewed and resolved.' 
              : 'Try selecting a different status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(r => {
            const isLockActive = processingId?.startsWith(r._id);
            const isTargetListing = r.targetType === 'LISTING';
            const listing = r.targetItem;
            const isResolvedOrDismissed = r.status === 'RESOLVED' || r.status === 'DISMISSED';

            return (
              <div 
                key={r._id} 
                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:border-[var(--border-secondary)] transition-all"
              >
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      🚩 {r.reason}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      Target: {r.targetType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                      r.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      r.status === 'DISMISSED' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}>
                      {r.status || 'OPEN'}
                    </span>
                  </div>

                  {/* Reported Item Details */}
                  {isTargetListing && listing && (
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
                      {listing.images?.[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-12 h-12 rounded-xl object-cover border border-[var(--border-subtle)] shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                          📦
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[var(--text-primary)] truncate">
                          {listing.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                          <span>{listing.currencySymbol || '₹'}{listing.price?.toLocaleString()}</span>
                          <span>•</span>
                          <span>Seller: {listing.sellerId?.name || listing.sellerId?.email || 'Unknown'}</span>
                          <span>•</span>
                          <span className={`font-bold ${listing.status === 'REMOVED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                            Listing Status: {listing.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Report Description */}
                  <div>
                    <span className="text-[11px] uppercase font-bold text-[var(--text-muted)] block">Report Description</span>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 leading-relaxed">
                      "{r.description || 'No description provided.'}"
                    </p>
                  </div>

                  {/* Resolution Notes (if resolved) */}
                  {r.resolutionNote && (
                    <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-indigo-400">Admin Resolution</span>
                      <p className="text-[var(--text-secondary)]">{r.resolutionNote}</p>
                    </div>
                  )}

                  {/* Meta footer */}
                  <div className="text-[11px] text-[var(--text-muted)] flex flex-wrap items-center gap-3 pt-1">
                    <span>Reported by: <strong>{r.reporterId?.name || r.reporterId?.email || 'User'}</strong></span>
                    <span>•</span>
                    <span>Date: {new Date(r.createdAt).toLocaleString()}</span>
                    {r.resolvedBy && (
                      <>
                        <span>•</span>
                        <span>Resolved by: <strong>{r.resolvedBy.name || r.resolvedBy.email || 'Admin'}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                {!isResolvedOrDismissed ? (
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                    {/* Take Action */}
                    <button
                      onClick={() => openActionPrompt(r, 'TAKE_ACTION')}
                      disabled={isLockActive}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>⚡</span>
                      <span>Take Action</span>
                    </button>

                    {/* Remove Item */}
                    <button
                      onClick={() => openActionPrompt(r, 'REMOVE_ITEM')}
                      disabled={isLockActive}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>🗑️</span>
                      <span>Remove Item</span>
                    </button>

                    {/* Dismiss Flag */}
                    <button
                      onClick={() => handleExecuteAction(r._id, 'DISMISS')}
                      disabled={isLockActive}
                      className="px-4 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>✓</span>
                      <span>Dismiss Flag</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-muted)] shrink-0 self-start lg:self-auto">
                    Resolved
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action / Removal Confirmation Modal */}
      {actionModal.isOpen && actionModal.report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>{actionModal.action === 'REMOVE_ITEM' ? '🗑️ Remove Reported Item' : '⚡ Moderate Report Action'}</span>
              </h3>
              <button
                onClick={() => setActionModal({ isOpen: false, report: null, action: '' })}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {actionModal.action === 'REMOVE_ITEM' ? (
                <>
                  This will change the listing status to <strong>REMOVED</strong>, hide it from the public marketplace, record your audit ID, and send a notification to the seller.
                </>
              ) : (
                <>
                  Apply administrative resolution to this safety report and record the action taken.
                </>
              )}
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Resolution Notes / Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder={actionModal.action === 'REMOVE_ITEM' ? 'e.g. Prohibited item or misleading property pricing' : 'e.g. Verified and action taken with seller'}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--button-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal({ isOpen: false, report: null, action: '' })}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction(actionModal.report._id, actionModal.action, resolutionNotes)}
                disabled={Boolean(processingId)}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 ${
                  actionModal.action === 'REMOVE_ITEM' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {processingId ? <Loader size="sm" /> : (
                  <span>Confirm {actionModal.action === 'REMOVE_ITEM' ? 'Removal' : 'Resolution'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
