import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api/admin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

export function AdminBuyers() {
  const { showToast } = useToast();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  // 1. Debounce Search Input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Fetch Buyers with cancellation
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadBuyers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Admin Buyers] Fetching buyers list...', { search });
        }

        const response = await adminService.getBuyers({
          q: search
        });

        if (cancelled) return;

        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response?.buyers)) {
          list = response.buyers;
        } else if (Array.isArray(response?.data?.buyers)) {
          list = response.data.buyers;
        }

        setBuyers(list);
      } catch (err) {
        if (cancelled) return;

        let errorMsg = 'Unable to load buyer data. Please try again.';
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

    loadBuyers();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [search, refreshTrigger, showToast]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              &larr; Admin Dashboard
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-blue-400">Buyer Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Buyer Management & Directory
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track registered buyers, purchase volumes, total spend, and contact records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search & Error */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search buyer by name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-400 text-xs">
            <span>{error}</span>
            <button onClick={handleRefresh} className="font-bold underline hover:opacity-80 cursor-pointer">Retry</button>
          </div>
        )}
      </div>

      {/* Buyers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" />
          <span className="text-xs font-bold text-[var(--text-secondary)]">Loading buyer accounts...</span>
        </div>
      ) : buyers.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-3">
          <div className="text-4xl">🛍️</div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No Buyers Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">No buyer accounts match your current search query.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
          <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Buyer Details</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Total Purchases</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {buyers.map((buyer) => (
                <tr key={buyer._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400 shrink-0">
                        {buyer.name?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>{buyer.name}</span>
                          {buyer.verificationStatus === 'VERIFIED' && (
                            <span className="text-xs text-blue-400" title="Verified">✓</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{buyer.email}</div>
                        {buyer.phone && (
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{buyer.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-[var(--text-secondary)]">
                    {buyer.location?.city ? `${buyer.location.city}, ${buyer.location.country}` : buyer.location?.country || 'India'}
                  </td>
                  <td className="py-4 px-4 text-xs text-[var(--text-secondary)]">
                    {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{buyer.totalPurchases || 0} Orders</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-sm text-emerald-400">
                      {formatListingPrice(buyer.totalSpent || 0, 'INR')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedBuyer(buyer)}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg font-bold text-xs text-[var(--text-secondary)] transition-colors cursor-pointer"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buyer Details Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg font-black text-blue-400">
                  {selectedBuyer.name?.charAt(0) || 'B'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">{selectedBuyer.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{selectedBuyer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Account Role</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedBuyer.role}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Purchases</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedBuyer.totalPurchases || 0} Orders</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Spend</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatListingPrice(selectedBuyer.totalSpent || 0, 'INR')}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Phone</span>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedBuyer.phone || 'Not provided'}</p>
              </div>
            </div>

            {selectedBuyer.bio && (
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Bio</span>
                <p className="text-[var(--text-secondary)]">{selectedBuyer.bio}</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setSelectedBuyer(null)}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

export default AdminBuyers;
