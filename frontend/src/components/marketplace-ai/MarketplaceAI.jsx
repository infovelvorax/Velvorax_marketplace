import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/api/ai.service';
import { favoriteService } from '../../services/api/favorite.service';
import { formatListingPrice } from '../../utils/formatters';
import './MarketplaceAI.css';

const DEFAULT_BUYER_SUGGESTIONS = [
  "Properties in Chennai 2BHK",
  "Laptops under ₹50,000",
  "Bikes near Chennai",
  "Software jobs in Bangalore",
  "Plumber in Coimbatore"
];

const DEFAULT_SELLER_SUGGESTIONS = [
  "Show my listings",
  "Store statistics & views",
  "Pending moderation status",
  "How to create a listing"
];

export function MarketplaceAI() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedRolePrompt, setSelectedRolePrompt] = useState(null); // 'buyer' | 'seller' | null
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [savedListingIds, setSavedListingIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Extract current listing ID context if user is on listing/property details page
  const listingIdMatch = location.pathname.match(/\/(?:listing|properties)\/([a-fA-F0-9]{24})/);
  const currentListingId = listingIdMatch ? listingIdMatch[1] : null;

  const rawRole = (user?.role || '').toUpperCase();
  const isSeller = ['SELLER', 'PROVIDER', 'EMPLOYER', 'BUSINESS'].includes(rawRole);
  const isAdmin = ['ADMIN', 'MODERATOR'].includes(rawRole);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isClosing) {
      scrollToBottom();
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isClosing, messages, loading]);

  // Initialize welcome message when opened and role is verified
  useEffect(() => {
    if (!isOpen) return;

    if (isAuthenticated) {
      if (isAdmin) {
        setMessages([
          {
            id: 'admin-notice',
            sender: 'assistant',
            message: "You are signed in as an **Administrator**. Please access the dedicated **Admin AI** in the Admin Dashboard for executive analytics, revenue reports, and moderation queues.",
            actionLinks: [{ label: 'Go to Admin Dashboard', url: '/admin' }]
          }
        ]);
      } else if (isSeller) {
        if (messages.length === 0) {
          setMessages([
            {
              id: 'welcome-seller',
              sender: 'assistant',
              message: `Hello **${user?.name || 'Seller'}**! I am your **Velvorax Seller Assistant**. I can help you monitor your store listings, review moderation status, track orders, and write optimized listings.`,
              suggestions: DEFAULT_SELLER_SUGGESTIONS
            }
          ]);
        }
      } else {
        // Buyer mode
        if (messages.length === 0) {
          setMessages([
            {
              id: 'welcome-buyer',
              sender: 'assistant',
              message: `Hi **${user?.name || 'there'}**! I am your **Marketplace Assistant**. I search real approved listings across India and worldwide — from 2BHK apartments to electronics, cars, jobs, and services.`,
              suggestions: DEFAULT_BUYER_SUGGESTIONS
            }
          ]);
        }
      }
    }
  }, [isOpen, isAuthenticated, rawRole]);

  // Load conversation history for authenticated user
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!isAuthenticated || isAdmin) return;
      try {
        const res = await aiService.getMarketplaceAIHistory(conversationId);
        const payload = res?.data || res || {};
        if (isMounted && Array.isArray(payload?.messages) && payload.messages.length > 0) {
          if (payload.conversationId) setConversationId(payload.conversationId);
          setMessages(
            payload.messages.map((m) => ({
              id: m.id || m._id || 'msg_' + Math.random(),
              sender: m.sender,
              message: m.message,
              listingCards: m.metadata?.listingCards || m.metadata?.results || [],
              statsCards: m.metadata?.statsCards || [],
              suggestions: m.metadata?.suggestions || []
            }))
          );
        }
      } catch (err) {
        // Silently continue if history is fresh
      }
    }

    if (isOpen && isAuthenticated && !conversationId) {
      loadHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, isAuthenticated]);

  const handleClose = () => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 240);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  // Toggle favorite / save
  const handleToggleSave = async (listingId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await favoriteService.toggleFavorite(listingId);
      setSavedListingIds((prev) => {
        const next = new Set(prev);
        if (next.has(listingId)) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle save listing:', err);
    }
  };

  // Send query to unified Marketplace AI backend
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    if (!isAuthenticated) {
      setSelectedRolePrompt('buyer');
      return;
    }

    if (isAdmin) {
      return;
    }

    const userMessageId = 'usr_' + Date.now();
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        message: query
      }
    ];

    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await aiService.chatWithMarketplaceAI({
        message: query,
        conversationId,
        currentListingId,
        currentRoute: location.pathname
      });

      const responseData = res?.data || res || {};
      if (responseData.conversationId) {
        setConversationId(responseData.conversationId);
      }

      const safeListingCards = Array.isArray(responseData.listingCards)
        ? responseData.listingCards
        : Array.isArray(responseData.results)
        ? responseData.results
        : [];

      const safeStatsCards = Array.isArray(responseData.statsCards)
        ? responseData.statsCards
        : [];

      const defaultReply = isSeller
        ? "Here are your store updates:"
        : (safeListingCards.length > 0
            ? `I found ${safeListingCards.length} matching approved listings:`
            : "I couldn't find approved listings matching that exact criteria. Try broadening your budget or location.");

      const replyMessage = responseData.message || defaultReply;
      const safeSuggestions = Array.isArray(responseData.suggestions) && responseData.suggestions.length > 0
        ? responseData.suggestions
        : (isSeller ? DEFAULT_SELLER_SUGGESTIONS : DEFAULT_BUYER_SUGGESTIONS);

      setMessages([
        ...newMessages,
        {
          id: responseData.messageId || 'asst_' + Date.now(),
          sender: 'assistant',
          message: replyMessage,
          listingCards: safeListingCards,
          statsCards: safeStatsCards,
          suggestions: safeSuggestions,
          actionLinks: responseData.actionLinks || []
        }
      ]);
    } catch (err) {
      console.error('Marketplace AI error:', err);
      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          message: "I couldn't connect to the AI search service right now. Please try again.",
          suggestions: isSeller ? DEFAULT_SELLER_SUGGESTIONS : DEFAULT_BUYER_SUGGESTIONS
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your Marketplace AI conversation history?')) return;
    try {
      await aiService.clearMarketplaceAIHistory(conversationId);
      setConversationId(null);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <>
      {/* Floating Animated Robot Trigger (Icon Only) */}
      <div className="marketplace-ai-trigger-wrap">
        <button
          type="button"
          onClick={handleToggle}
          className="marketplace-ai-robot-btn"
          aria-label="Open Marketplace AI Assistant"
          title={isOpen ? "Close AI Assistant" : (isAuthenticated ? (isSeller ? "Seller AI Assistant" : "Buyer AI Assistant") : "Marketplace AI Assistant")}
        >
          <div className="marketplace-robot-icon-wrap">
            <span style={{ fontSize: '24px' }}>🤖</span>
            <span className="marketplace-online-dot"></span>
          </div>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className={`marketplace-ai-modal ${isClosing ? 'closing' : ''}`}>
          {/* Header */}
          <div className="marketplace-ai-header">
            <div className="marketplace-ai-header-info">
              <div className="marketplace-robot-icon-wrap" style={{ width: '34px', height: '34px' }}>
                <span style={{ fontSize: '18px' }}>🤖</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    Marketplace AI
                  </span>
                  <span
                    className={`marketplace-ai-header-badge ${
                      !isAuthenticated ? 'badge-guest' : isSeller ? 'badge-seller' : 'badge-buyer'
                    }`}
                  >
                    {!isAuthenticated ? 'Explore' : isSeller ? 'Seller Mode' : 'Buyer Mode'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {isAuthenticated
                    ? isSeller
                      ? 'Store & Moderation Intelligence'
                      : 'Live Real-Time Database Search'
                    : 'Personalized Marketplace Intelligence'}
                </div>
              </div>
            </div>

            <div className="marketplace-ai-header-actions">
              {isAuthenticated && !isAdmin && messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="marketplace-ai-icon-btn"
                  title="Clear Chat History"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="marketplace-ai-icon-btn"
                title="Close AI Assistant"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="marketplace-ai-body">
            {/* 1. Unauthenticated Role Selection View */}
            {!isAuthenticated && !selectedRolePrompt && (
              <div className="marketplace-role-selection-box">
                <div className="marketplace-role-header-icon">🤖</div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                    Hi! I can help you explore the marketplace.
                  </h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '320px', margin: '0 auto' }}>
                    What are you looking for today? Select your role to get personalized assistance:
                  </p>
                </div>

                <div className="marketplace-role-cards-grid">
                  <button
                    type="button"
                    onClick={() => setSelectedRolePrompt('buyer')}
                    className="marketplace-role-card"
                  >
                    <span className="marketplace-role-card-icon">🛍️</span>
                    <span className="marketplace-role-card-title">I'm a Buyer</span>
                    <span className="marketplace-role-card-desc">
                      Find properties, cars, laptops, jobs, services & giveaways
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRolePrompt('seller')}
                    className="marketplace-role-card"
                  >
                    <span className="marketplace-role-card-icon">🏪</span>
                    <span className="marketplace-role-card-title">I'm a Seller</span>
                    <span className="marketplace-role-card-desc">
                      Manage listings, check moderation status & boost store sales
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Unauthenticated Auth Required View */}
            {!isAuthenticated && selectedRolePrompt && (
              <div className="marketplace-auth-prompt-box">
                <div style={{ fontSize: '32px' }}>
                  {selectedRolePrompt === 'buyer' ? '🛍️' : '🏪'}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                    {selectedRolePrompt === 'buyer'
                      ? 'Please sign in to continue as a Buyer.'
                      : 'Please sign in to continue as a Seller.'}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                    {selectedRolePrompt === 'buyer'
                      ? 'Sign in to search real database listings, save favorites, and chat with verified sellers.'
                      : 'Sign in to access your store inventory, listing drafts, and sales analytics.'}
                  </p>
                </div>

                <div className="marketplace-auth-buttons">
                  <Link
                    to="/login"
                    onClick={handleClose}
                    className="marketplace-btn-primary"
                  >
                    Sign In
                  </Link>

                  <Link
                    to={selectedRolePrompt === 'buyer' ? '/register?role=buyer' : '/register?role=seller'}
                    onClick={handleClose}
                    className="marketplace-btn-secondary"
                  >
                    {selectedRolePrompt === 'buyer' ? 'Create Buyer Account' : 'Create Seller Account'}
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedRolePrompt(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Choose different role
                  </button>
                </div>
              </div>
            )}

            {/* 3. Authenticated Messages View */}
            {isAuthenticated && (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ai-msg-row ${msg.sender === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="ai-msg-bubble">
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.message}</div>

                      {/* Admin Links */}
                      {Array.isArray(msg.actionLinks) && msg.actionLinks.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {msg.actionLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              to={link.url}
                              onClick={handleClose}
                              className="marketplace-btn-primary"
                              style={{ padding: '8px 14px', fontSize: '12px' }}
                            >
                              {link.label} →
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Seller Stats Cards */}
                      {Array.isArray(msg.statsCards) && msg.statsCards.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                          {msg.statsCards.map((stat, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '10px 12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{stat.label}</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: stat.color || '#ffffff' }}>
                                {stat.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Real Listing Cards Carousel */}
                      {Array.isArray(msg.listingCards) && msg.listingCards.length > 0 && (
                        <div className="marketplace-cards-carousel">
                          {msg.listingCards.map((item) => {
                            const listingId = item.id || item._id;
                            const targetUrl = item.url || (item.categorySlug === 'properties' ? `/properties/${listingId}` : `/listing/${listingId}`);
                            const isSaved = savedListingIds.has(listingId);

                            return (
                              <div key={listingId} className="marketplace-chat-card">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="marketplace-chat-card-img"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div
                                    className="marketplace-chat-card-img"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '28px',
                                      color: '#6366f1'
                                    }}
                                  >
                                    📦
                                  </div>
                                )}

                                <div className="marketplace-chat-card-body">
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '4px' }}>
                                      {item.categoryName || item.categorySlug}
                                    </span>
                                    {item.status && (
                                      <span
                                        style={{
                                          fontSize: '9px',
                                          fontWeight: 800,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          background: item.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                          color: item.status === 'APPROVED' ? '#6ee7b7' : '#fca5a5'
                                        }}
                                      >
                                        {item.status}
                                      </span>
                                    )}
                                  </div>

                                  <div className="marketplace-chat-card-title">{item.title}</div>
                                  <div className="marketplace-chat-card-price">
                                    {formatListingPrice(item.price, item.currency || 'INR', null, { listingType: item.listingType })}
                                  </div>

                                  <div className="marketplace-chat-card-loc">
                                    <span>📍</span>
                                    <span style={{ truncate: true }}>
                                      {item.location?.city || item.location?.region || 'India'}
                                    </span>
                                  </div>

                                  <div className="marketplace-chat-card-actions">
                                    <Link
                                      to={targetUrl}
                                      onClick={handleClose}
                                      className="marketplace-card-btn-view"
                                    >
                                      View Listing
                                    </Link>
                                    {!isSeller && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSave(listingId)}
                                        className={`marketplace-card-btn-save ${isSaved ? 'saved' : ''}`}
                                        title={isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
                                      >
                                        {isSaved ? '❤️' : '🤍'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Quick Suggestions Chips */}
                      {Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                        <div className="marketplace-ai-suggestions-wrap">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(sug)}
                              className="marketplace-suggestion-chip"
                            >
                              🔍 {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Typing Indicator */}
                {loading && (
                  <div className="ai-msg-row assistant">
                    <div className="ai-typing-indicator">
                      <div className="ai-typing-dot"></div>
                      <div className="ai-typing-dot"></div>
                      <div className="ai-typing-dot"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Input Bar */}
          {isAuthenticated && !isAdmin && (
            <div className="marketplace-ai-footer">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="marketplace-ai-input-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isSeller
                      ? 'Ask about store listings, status, sales...'
                      : 'Ask about properties, cars, laptops, jobs...'
                  }
                  className="marketplace-ai-input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="marketplace-ai-send-btn"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default MarketplaceAI;
