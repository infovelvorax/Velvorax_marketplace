import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api/admin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';

export function AdminSellers() {
  const { showToast } = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals & Action States
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Debounce Search Input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Sellers Data with Clean Cancellation Lifecycle
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadSellers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getSellers({
          status: statusFilter,
          q: search
        });

        if (cancelled) return;

        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response?.sellers)) {
          list = response.sellers;
        } else if (Array.isArray(response?.data?.sellers)) {
          list = response.data.sellers;
        }

        setSellers(list);
      } catch (err) {
        if (cancelled) return;

        let errorMsg = 'Unable to load seller data. Please try again.';
        const statusCode = err?.response?.status || err?.status;

        if (statusCode === 401) {
          errorMsg = 'Your admin session has expired. Please sign in again.';
        } else if (statusCode === 403) {
          errorMsg = 'You do not have permission to access this area.';
        } else if (err?.message && !err.message.includes('aborted')) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        showToast('error', errorMsg);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSellers();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [statusFilter, search, refreshTrigger, showToast]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleModerate = async (sellerId, action, reason = '') => {
    setProcessingId(sellerId);
    try {
      await adminService.moderateSeller(sellerId, { action, reason });
      showToast('success', `Seller successfully ${action.toLowerCase()}d.`);
      handleRefresh();
      if (selectedSeller?._id === sellerId) {
        setSelectedSeller(null);
      }
      setRejectModalOpen(false);
      setRejectionReason('');
    } catch (err) {
      showToast('error', err.message || `Failed to ${action.toLowerCase()} seller`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs">✓ Approved</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse shadow-2xs">⏳ Pending</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-2xs">✕ Rejected</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 shadow-2xs">Suspended</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-zinc-500/10 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 sm:py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              &larr; Admin Command
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-emerald-400">Seller Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Seller Accounts & Approvals
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Review onboarding seller applications, approve selling privileges, and manage merchant verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">🔍</span>
          <input
            type="text"
            placeholder="Search seller by name, email, phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-400 text-xs">
          <span>{error}</span>
          <button onClick={handleRefresh} className="font-bold underline hover:opacity-80 cursor-pointer">Retry</button>
        </div>
      )}

      {/* Sellers Feed */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" />
          <span className="text-xs font-bold text-[var(--text-secondary)]">Loading seller accounts...</span>
        </div>
      ) : sellers.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-3 shadow-xs">
          <div className="text-5xl">📦</div>
          <h3 className="text-lg font-black text-[var(--text-primary)]">No Sellers Found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">No seller accounts match your current filter criteria.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {sellers.map((seller) => (
              <div
                key={seller._id}
                className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs space-y-4"
              >
                {/* Top Seller Info */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0 uppercase">
                      {seller.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{seller.name}</span>
                        {seller.verificationStatus === 'VERIFIED' && (
                          <span className="text-xs text-blue-400 font-bold" title="Verified Identity">✓</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{seller.email}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(seller.sellerStatus)}</div>
                </div>

                {/* Seller Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Listings</span>
                    <span className="font-black text-[var(--text-primary)]">{seller.totalListings || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Live</span>
                    <span className="font-black text-emerald-400">{seller.approvedListings || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Sales</span>
                    <span className="font-black text-purple-400">{seller.totalSales || 0}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  {seller.sellerStatus === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleModerate(seller._id, 'APPROVE')}
                        disabled={processingId === seller._id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setRejectModalOpen(true);
                        }}
                        disabled={processingId === seller._id}
                        className="flex-1 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {seller.sellerStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleModerate(seller._id, 'SUSPEND')}
                      disabled={processingId === seller._id}
                      className="flex-1 py-2 bg-[var(--bg-secondary)] hover:bg-rose-600/10 text-rose-400 border border-[var(--border-primary)] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Suspend
                    </button>
                  )}
                  {seller.sellerStatus === 'SUSPENDED' && (
                    <button
                      onClick={() => handleModerate(seller._id, 'APPROVE')}
                      disabled={processingId === seller._id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedSeller(seller)}
                    className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl font-bold text-xs text-[var(--text-secondary)] transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
            <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Seller Details</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Listings</th>
                  <th className="py-4 px-4">Total Sales</th>
                  <th className="py-4 px-4">Approval Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0">
                          {seller.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                            <span>{seller.name}</span>
                            {seller.verificationStatus === 'VERIFIED' && (
                              <span className="text-xs text-blue-400 font-bold" title="Verified Identity">✓</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{seller.email}</div>
                          {seller.phone && (
                            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{seller.phone}</div>
                          )}
                          {(seller.verification?.aadhaarMasked || seller.verification?.panMasked) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {seller.verification?.aadhaarMasked && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  🆔 {seller.verification.aadhaarMasked}
                                </span>
                              )}
                              {seller.verification?.panMasked && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  💳 {seller.verification.panMasked}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-[var(--text-secondary)]">
                      {seller.location?.city ? `${seller.location.city}, ${seller.location.country}` : seller.location?.country || 'India'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{seller.totalListings || 0} Total</div>
                      <div className="text-[11px] text-emerald-400">{seller.approvedListings || 0} Live</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{seller.totalSales || 0} Orders</span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(seller.sellerStatus)}
                      {seller.sellerRejectionReason && (
                        <div className="text-[10px] text-rose-400 mt-1 max-w-[140px] truncate" title={seller.sellerRejectionReason}>
                          Reason: {seller.sellerRejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {seller.sellerStatus === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleModerate(seller._id, 'APPROVE')}
                              disabled={processingId === seller._id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSeller(seller);
                                setRejectModalOpen(true);
                              }}
                              disabled={processingId === seller._id}
                              className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}

                        {seller.sellerStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleModerate(seller._id, 'SUSPEND')}
                            disabled={processingId === seller._id}
                            className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-rose-600/10 text-rose-400 border border-[var(--border-primary)] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {seller.sellerStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => handleModerate(seller._id, 'APPROVE')}
                            disabled={processingId === seller._id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl font-bold text-xs text-[var(--text-secondary)] transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-[var(--text-primary)]">Reject Seller Application</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Specify the reason for rejecting <strong>{selectedSeller.name}</strong> ({selectedSeller.email}). This reason will be sent in a notification to the seller.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Incomplete business address or unverifiable contact information."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(selectedSeller._id, 'REJECT', rejectionReason)}
                disabled={processingId === selectedSeller._id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Inspection Modal */}
      {selectedSeller && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg font-black text-emerald-400">
                  {selectedSeller.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">{selectedSeller.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{selectedSeller.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Role & Category</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5 capitalize">{selectedSeller.role} ({selectedSeller.sellerCategory || selectedSeller.activeCategory || 'All Sectors'})</p>
              </div>
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Seller Status</span>
                <div className="mt-1">{getStatusBadge(selectedSeller.sellerStatus)}</div>
              </div>
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Phone</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedSeller.phone || 'Not provided'}</p>
              </div>
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Location</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">
                  {selectedSeller.location?.city ? `${selectedSeller.location.city}, ${selectedSeller.location.country}` : 'India'}
                </p>
              </div>
            </div>

            {/* KYC Identity Verification Box */}
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Seller KYC Identity Verification</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {selectedSeller.verification?.status || selectedSeller.verificationStatus || 'PENDING'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block font-medium">Masked Aadhaar Number</span>
                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                    {selectedSeller.verification?.aadhaarMasked || selectedSeller.aadhaarMasked || 'XXXX XXXX ••••'}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block font-medium">Masked PAN Card</span>
                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                    {selectedSeller.verification?.panMasked || selectedSeller.panMasked || 'XXXXX••••X'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] pt-1 flex items-center justify-between">
                <span>Registration Date: {new Date(selectedSeller.createdAt).toLocaleDateString()}</span>
                {selectedSeller.verification?.submittedAt && (
                  <span>KYC Submitted: {new Date(selectedSeller.verification.submittedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {selectedSeller.sellerRejectionReason && (
              <div className="p-3.5 bg-rose-500/5 rounded-2xl border border-rose-500/20 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400">Rejection Reason</span>
                <p className="text-rose-300">{selectedSeller.sellerRejectionReason}</p>
              </div>
            )}

            {selectedSeller.bio && (
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Seller Bio</span>
                <p className="text-[var(--text-secondary)]">{selectedSeller.bio}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              {selectedSeller.sellerStatus === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => handleModerate(selectedSeller._id, 'APPROVE')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    ✓ Approve Seller
                  </button>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    ✕ Reject Application
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSellers;
