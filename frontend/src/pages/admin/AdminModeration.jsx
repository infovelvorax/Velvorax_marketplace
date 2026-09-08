import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/admin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { formatCurrency, cn } from '../../utils';

export function AdminModeration() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'verifications'
  
  // Listings Queue State
  const [listings, setListings] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('properties');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Verifications Queue State
  const [verifications, setVerifications] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);

  // Dialog State
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionModalType, setActionModalType] = useState(null); // 'REJECT' | 'CHANGES_REQUESTED' | 'INSPECT'
  const [modalReason, setModalReason] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchQueue = async () => {
      if (activeTab === 'listings') {
        setLoading(true);
        try {
          const data = await adminService.getPendingListings({ category: categoryFilter });
          if (cancelled) return;
          const items = Array.isArray(data) ? data : (data?.data?.listings || data?.listings || data?.data || []);
          setListings(items);
        } catch (err) {
          if (cancelled) return;
          console.error('Failed to fetch listings queue', err);
          showToast('error', 'Failed to load moderation listings');
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        setLoadingVerifications(true);
        try {
          const data = await adminService.getSellerVerifications();
          if (cancelled) return;
          const items = Array.isArray(data) ? data : (data?.data?.verifications || data?.verifications || data?.data || []);
          setVerifications(items);
        } catch (err) {
          if (cancelled) return;
          console.error('Failed to fetch verifications queue', err);
        } finally {
          if (!cancelled) setLoadingVerifications(false);
        }
      }
    };

    fetchQueue();

    return () => {
      cancelled = true;
    };
  }, [activeTab, categoryFilter, refreshTrigger, showToast]);

  const handleModerateListing = async (listingId, action, reason = '') => {
    setActionLoading(listingId);
    try {
      await adminService.moderateListing(listingId, {
        status: action,
        reason: reason || undefined
      });
      showToast('success', `Listing marked as ${action.replace('_', ' ')}`);
      setListings(prev => prev.filter(item => item._id !== listingId));
      setActionModalType(null);
      setSelectedItem(null);
      setModalReason('');
    } catch (e) {
      showToast('error', e.message || 'Failed to update moderation status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateSeller = async (verificationId, action, reason = '') => {
    setActionLoading(verificationId);
    try {
      await adminService.moderateSellerVerification(verificationId, {
        status: action,
        reason: reason || undefined
      });
      showToast('success', `Seller verification marked as ${action}`);
      setVerifications(prev => prev.filter(item => item._id !== verificationId));
      setActionModalType(null);
      setSelectedItem(null);
      setModalReason('');
    } catch (e) {
      showToast('error', e.message || 'Failed to update seller verification');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 sm:py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              &larr; Admin Command
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-indigo-400">Quality Assurance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Listing Moderation & Approvals
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Review pending property and product listings, enforce marketplace standards, and verify seller compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTrigger(k => k + 1)}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={cn(
            'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'listings'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
          )}
        >
          <span>🏢</span>
          <span>Pending Listings ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verifications')}
          className={cn(
            'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'verifications'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
          )}
        >
          <span>🪪</span>
          <span>Seller ID Verifications ({verifications.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING LISTINGS QUEUE */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Category:</span>
            {['properties', 'all', 'vehicles', 'products', 'jobs'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize',
                  categoryFilter === cat
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-primary)] shadow-xs'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader size="lg" />
              <span className="text-xs font-bold text-[var(--text-secondary)]">Fetching pending listings...</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 sm:p-16 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-3 shadow-xs">
              <div className="text-5xl">✅</div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">All Clear! No Pending Listings</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                All submitted property listings in the <span className="font-bold text-[var(--text-primary)] capitalize">{categoryFilter}</span> category have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(item => {
                const details = item.details || {};
                return (
                  <div
                    key={item._id}
                    className="p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:border-[var(--border-subtle)] transition-all"
                  >
                    {/* Left: Image & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200'}
                        alt={item.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-[var(--bg-secondary)] border border-[var(--border-primary)] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.categorySlug || 'properties'}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                            {item.listingType}
                          </span>
                          {details.bhk && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                              {details.bhk}
                            </span>
                          )}
                          {details.builtUpArea && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                              {details.builtUpArea} sq.ft
                            </span>
                          )}
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            • Posted by <strong>{item.sellerId?.name || 'Seller'}</strong>
                          </span>
                        </div>

                        <h3 className="font-black text-[var(--text-primary)] text-base sm:text-lg truncate">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                          {item.description}
                        </p>

                        <div className="text-xs font-bold text-[var(--text-primary)] mt-2 flex items-center gap-3 flex-wrap">
                          <span className="text-emerald-400 font-black text-sm">
                            {formatCurrency(item.price, item.currency)}
                          </span>
                          <span className="text-[var(--text-secondary)]">
                            📍 {[item.location?.localArea, item.location?.city, item.location?.country].filter(Boolean).join(', ')}
                          </span>
                          {details.completenessScore && (
                            <span className="text-xs font-black text-blue-400">
                              Quality Score: {details.completenessScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Moderation Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setActionModalType('INSPECT');
                        }}
                        className="px-3.5 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        🔍 Inspect
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading === item._id}
                        onClick={() => handleModerateListing(item._id, 'APPROVED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading === item._id}
                        onClick={() => {
                          setSelectedItem(item);
                          setActionModalType('CHANGES_REQUESTED');
                        }}
                        className="px-3.5 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Request Changes
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading === item._id}
                        onClick={() => {
                          setSelectedItem(item);
                          setActionModalType('REJECT');
                        }}
                        className="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SELLER IDENTITY VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {loadingVerifications ? (
            <div className="py-24 flex justify-center"><Loader size="lg" /></div>
          ) : verifications.length === 0 ? (
            <div className="p-12 sm:p-16 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-3 shadow-xs">
              <div className="text-5xl">🪪</div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">No Pending Seller Verifications</h3>
              <p className="text-xs text-[var(--text-secondary)]">All submitted merchant identity documents have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map(ver => (
                <div
                  key={ver._id}
                  className="p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        {ver.sellerId?.name || 'Seller'}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] font-mono">({ver.sellerId?.email})</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] space-y-1">
                      <div>Document: <strong className="text-[var(--text-primary)]">{ver.documentType}</strong></div>
                      <div>Masked Aadhaar: <code className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{ver.aadhaarMasked || 'N/A'}</code></div>
                      <div>Masked PAN: <code className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{ver.panMasked || 'N/A'}</code></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ver.documentUrl && (
                      <a
                        href={ver.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        View Document &rarr;
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={actionLoading === ver._id}
                      onClick={() => handleModerateSeller(ver._id, 'VERIFY')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✓ Verify Seller
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === ver._id}
                      onClick={() => handleModerateSeller(ver._id, 'REJECT')}
                      className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTION MODAL: INSPECT / REJECT / REQUEST CHANGES */}
      {actionModalType && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-[var(--text-primary)] max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-black">
                {actionModalType === 'INSPECT' && 'Inspect Property Listing'}
                {actionModalType === 'REJECT' && 'Reject Property Listing'}
                {actionModalType === 'CHANGES_REQUESTED' && 'Request Listing Revisions'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActionModalType(null);
                  setSelectedItem(null);
                  setModalReason('');
                }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4">
              {actionModalType === 'INSPECT' ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedItem.images?.map((img, i) => (
                      <img key={i} src={img} alt="preview" className="w-full h-24 object-cover rounded-xl border border-[var(--border-primary)]" />
                    ))}
                  </div>
                  <div className="space-y-1.5 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                    <div><strong>Title:</strong> {selectedItem.title}</div>
                    <div><strong>Price:</strong> {formatCurrency(selectedItem.price, selectedItem.currency)}</div>
                    <div><strong>Type:</strong> {selectedItem.details?.propertyType} ({selectedItem.details?.bhk})</div>
                    <div><strong>Area:</strong> {selectedItem.details?.builtUpArea} sq.ft</div>
                    <div><strong>Furnishing:</strong> {selectedItem.details?.furnishing}</div>
                    <div><strong>Status:</strong> {selectedItem.details?.possessionStatus}</div>
                    <div><strong>Location:</strong> {[selectedItem.location?.localArea, selectedItem.location?.city, selectedItem.location?.country].filter(Boolean).join(', ')}</div>
                  </div>
                  <div>
                    <strong>Full Description:</strong>
                    <p className="text-[var(--text-secondary)] mt-1 whitespace-pre-line leading-relaxed bg-[var(--bg-secondary)]/50 p-3 rounded-xl border border-[var(--border-subtle)]">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {actionModalType === 'REJECT'
                      ? 'Please enter the reason for rejecting this property listing. The seller will see this reason in their dashboard.'
                      : 'Explain the required changes so the seller can revise and resubmit their listing (e.g. upload clearer photos, correct price, specify carpet area).'}
                  </p>
                  <textarea
                    rows={4}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Enter detailed feedback for the seller..."
                    className="w-full p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActionModalType(null);
                  setSelectedItem(null);
                  setModalReason('');
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>

              {actionModalType === 'REJECT' && (
                <button
                  type="button"
                  disabled={!modalReason.trim() || actionLoading}
                  onClick={() => handleModerateListing(selectedItem._id, 'REJECTED', modalReason)}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              )}

              {actionModalType === 'CHANGES_REQUESTED' && (
                <button
                  type="button"
                  disabled={!modalReason.trim() || actionLoading}
                  onClick={() => handleModerateListing(selectedItem._id, 'CHANGES_REQUESTED', modalReason)}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Send Feedback
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModeration;
