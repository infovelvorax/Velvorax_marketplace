import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { chatService } from '../../services/api/chat.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link, useNavigate } from 'react-router-dom';

export function SellerContacts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chatService.getConversations();
      setConversations(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      showToast('error', err.message || 'Failed to load buyer contacts');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const currentUserId = user?._id?.toString() || user?.id?.toString();

  const filteredConversations = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return conversations;
    return (conversations || []).filter(conv => {
      if (!conv) return false;
      const otherUser = conv.participants?.find(p => {
        const pId = p?._id?.toString() || p?.id?.toString();
        return pId && pId !== currentUserId;
      }) || {};
      const name = (otherUser.name || '').toLowerCase();
      const email = (otherUser.email || '').toLowerCase();
      const phone = (otherUser.phone || '').toLowerCase();
      const listingTitle = (conv.listingId?.title || '').toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term) || listingTitle.includes(term);
    });
  }, [conversations, searchTerm, currentUserId]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 sm:py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/seller/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              &larr; Seller Workspace
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-blue-400">Buyer Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Buyer Contacts & Inquiries
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Buyers who contacted you regarding your product and property listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchContacts}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">🔍</span>
          <input
            type="text"
            placeholder="Search by buyer, phone, listing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-blue-500 transition-colors shadow-2xs"
          />
        </div>

        <div className="text-xs text-[var(--text-secondary)] font-bold self-end sm:self-center">
          Showing <span className="text-[var(--text-primary)]">{filteredConversations.length}</span> prospective customer{filteredConversations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" />
          <span className="text-xs font-bold text-[var(--text-secondary)]">Loading buyer contacts...</span>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-4 shadow-xs">
          <div className="text-5xl">💬</div>
          <h3 className="text-lg font-black text-[var(--text-primary)]">
            {searchTerm ? 'No Matching Buyers Found' : 'No Buyer Contacts Yet'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            {searchTerm
              ? 'Try searching with a different name, telephone number, or listing title.'
              : 'When buyers send messages or make inquiries on your listings, their full contact details, telephone dialers, and chat inquiries will appear here.'}
          </p>
          {!searchTerm && (
            <Link
              to="/seller/listings/new"
              className="px-6 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl inline-block shadow-xs hover:bg-[var(--button-primary-hover)] transition-all"
            >
              + Create New Listing &rarr;
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View (< 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredConversations.map((conv) => {
              const otherUser = conv.participants?.find(p => {
                const pId = p?._id?.toString() || p?.id?.toString();
                return pId && pId !== currentUserId;
              }) || { name: 'Prospective Buyer' };
              const buyerPhone = otherUser.phone || '';
              const buyerEmail = otherUser.email || '';
              const buyerLocation = [otherUser.location?.city, otherUser.location?.country].filter(Boolean).join(', ') || 'Online User';

              return (
                <div
                  key={conv._id}
                  className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs space-y-4"
                >
                  {/* Top user row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400 shrink-0 uppercase">
                        {otherUser.name?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>{otherUser.name || 'Prospective Buyer'}</span>
                          {otherUser.verificationStatus === 'VERIFIED' && (
                            <span className="text-xs text-blue-400 font-bold" title="Verified Identity">✓</span>
                          )}
                        </div>
                        <span className="text-[10px] text-blue-400 uppercase font-black tracking-wider">
                          Marketplace Buyer
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      📍 {buyerLocation}
                    </span>
                  </div>

                  {/* Inquired listing badge if exists */}
                  {conv.listingId?.title && (
                    <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Inquired Item</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate block">{conv.listingId.title}</span>
                      </div>
                      <Link
                        to={`/listing/${conv.listingId._id || conv.listingId}`}
                        className="text-xs font-bold text-blue-400 hover:underline shrink-0"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  )}

                  {/* Last message preview */}
                  <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)]/50 p-2.5 rounded-xl border border-[var(--border-subtle)]">
                    <span className="font-bold text-[var(--text-muted)] text-[10px] uppercase block mb-0.5">Latest Message</span>
                    <p className="truncate">{typeof conv.lastMessage === 'string' ? conv.lastMessage : (conv.lastMessage?.text || 'Sent an inquiry')}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    {buyerPhone && (
                      <a
                        href={`tel:${buyerPhone}`}
                        className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </a>
                    )}
                    {buyerEmail && (
                      <a
                        href={`mailto:${buyerEmail}`}
                        className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>✉️</span>
                        <span>Email</span>
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/messages?conversation=${conv._id}`)}
                      className="flex-1 py-2.5 bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>💬 Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
            <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Buyer Details</th>
                  <th className="py-4 px-4">Direct Phone</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Inquired Listing</th>
                  <th className="py-4 px-4">Last Message</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredConversations.map((conv) => {
                  const otherUser = conv.participants?.find(p => {
                    const pId = p?._id?.toString() || p?.id?.toString();
                    return pId && pId !== currentUserId;
                  }) || { name: 'Prospective Buyer' };
                  const buyerPhone = otherUser.phone || '';
                  const buyerEmail = otherUser.email || '';
                  const buyerLocation = [otherUser.location?.city, otherUser.location?.country].filter(Boolean).join(', ') || 'Online User';

                  return (
                    <tr key={conv._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400 shrink-0 uppercase">
                            {otherUser.name?.charAt(0) || 'B'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{otherUser.name || 'Prospective Buyer'}</span>
                              {otherUser.verificationStatus === 'VERIFIED' && (
                                <span className="text-[10px] text-blue-400 font-bold" title="Verified Identity">✓</span>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-400 uppercase font-black">
                              Marketplace Buyer
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold">
                        {buyerPhone ? (
                          <a
                            href={`tel:${buyerPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-bold text-xs transition-colors shadow-2xs"
                            title="Click to open device phone dialer"
                          >
                            <span>📞</span>
                            <span>{buyerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Via Direct Chat</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-medium">
                        {buyerEmail ? (
                          <a
                            href={`mailto:${buyerEmail}`}
                            className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                          >
                            <span>✉️</span>
                            <span className="truncate">{buyerEmail}</span>
                          </a>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-[var(--text-secondary)]">
                        <span>📍 {buyerLocation}</span>
                      </td>

                      <td className="py-4 px-4 font-bold text-[var(--text-primary)] max-w-xs truncate">
                        {conv.listingId?.title ? (
                          <Link
                            to={`/listing/${conv.listingId._id || conv.listingId}`}
                            className="text-blue-400 hover:underline truncate block max-w-[180px]"
                          >
                            🏷️ {conv.listingId.title}
                          </Link>
                        ) : (
                          <span className="text-[var(--text-muted)]">General Inquiry</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                        {typeof conv.lastMessage === 'string' ? conv.lastMessage : (conv.lastMessage?.text || 'Sent an inquiry')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {buyerPhone && (
                            <a
                              href={`tel:${buyerPhone}`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              title="Call Buyer"
                            >
                              📞 Call
                            </a>
                          )}
                          <button
                            onClick={() => navigate(`/dashboard/messages?conversation=${conv._id}`)}
                            className="px-3.5 py-1.5 bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Chat &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default SellerContacts;
