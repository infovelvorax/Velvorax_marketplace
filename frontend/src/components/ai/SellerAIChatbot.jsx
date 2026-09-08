import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { aiService } from '../../services/api/ai.service';
import { FloatingRobotButton } from './FloatingRobotButton';
import { formatListingPrice } from '../../utils/formatters';
import './SellerAIChatbot.css';

/**
 * Format markdown text safely for Seller AI
 */
function renderFormattedMessage(text = '') {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
    const cleanedLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

    const parts = cleanedLine.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-4 list-disc text-[13px] my-1 leading-relaxed text-slate-200">
          {formattedParts}
        </li>
      );
    }

    if (line.trim().startsWith('###')) {
      return (
        <h5 key={lineIdx} className="font-bold text-[14px] mt-2 mb-1 text-emerald-400">
          {line.replace(/^###\s*/, '')}
        </h5>
      );
    }

    if (!line.trim()) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return (
      <p key={lineIdx} className="text-[13px] my-1 leading-relaxed text-slate-200">
        {formattedParts}
      </p>
    );
  });
}

export function SellerAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'seller-welcome-msg',
      sender: 'assistant',
      message: "Hello! I am your **Velvorax Seller AI**. I can help you monitor your store listings, review moderation progress, track sales & revenue, and optimize your seller performance.",
      listingCards: [],
      statsCards: [],
      actionLinks: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeSuggestions, setActiveSuggestions] = useState([
    "Show my pending listings",
    "How many orders and sales?",
    "My listing views & performance",
    "Check verification status"
  ]);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Load history on mount or open
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await aiService.getSellerAIHistory(conversationId);
        if (isMounted && res?.data?.messages?.length > 0) {
          setConversationId(res.data.conversationId);
          setMessages(
            res.data.messages.map((m) => ({
              id: m.id,
              sender: m.sender,
              message: m.message,
              listingCards: m.metadata?.listingCards || [],
              statsCards: m.metadata?.statsCards || [],
              actionLinks: m.metadata?.actionLinks || []
            }))
          );
        }
      } catch (err) {
        // Silently continue if history is unavailable
      }
    }

    if (isOpen) {
      loadHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

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
      const res = await aiService.chatWithSellerAI({
        message: query,
        conversationId
      });

      const responseData = res.data?.data || res.data || {};
      if (responseData.conversationId) {
        setConversationId(responseData.conversationId);
      }

      setMessages([
        ...newMessages,
        {
          id: responseData.messageId || 'ast_' + Date.now(),
          sender: 'assistant',
          message: responseData.message || 'Here is the requested seller store information.',
          listingCards: responseData.listingCards || [],
          statsCards: responseData.statsCards || [],
          actionLinks: responseData.actionLinks || []
        }
      ]);
    } catch (error) {
      console.error('Seller AI Chat error:', error);
      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          message: "I am ready to help you manage your store. You can ask about your listings, pending moderation, or sales orders anytime.",
          listingCards: [],
          statsCards: [],
          actionLinks: [
            { label: 'My Listings', url: '/seller/listings' },
            { label: 'Buyer Contacts', url: '/seller/contacts' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    try {
      await aiService.clearSellerAIHistory(conversationId);
    } catch (err) {
      console.error('Clear history error:', err);
    }
    setMessages([
      {
        id: 'seller-welcome-msg-cleared',
        sender: 'assistant',
        message: "Conversation cleared. How can I assist you with your Velvorax store today?",
        listingCards: [],
        statsCards: [],
        actionLinks: []
      }
    ]);
  };

  return (
    <div className="seller-ai-container">
      {/* Animated Floating Robot Trigger */}
      <FloatingRobotButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        role="SELLER"
        isThinking={loading}
        tooltip="Ask Seller AI"
      />

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="seller-ai-modal" role="dialog" aria-label="Velvorax Seller AI Chat">
          {/* Header */}
          <div className="seller-ai-header">
            <div className="seller-ai-header-info">
              <div className="seller-ai-avatar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.651V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009 9.35c.692 0 1.345-.233 1.874-.627a3.001 3.001 0 003.75 0c.53.394 1.182.627 1.874.627a3.001 3.001 0 003.75-.615c.53.394 1.182.627 1.874.627z" />
                </svg>
              </div>
              <div className="seller-ai-title-wrap">
                <h4>Velvorax Seller AI</h4>
                <div className="seller-ai-status">
                  <span className="seller-ai-status-dot"></span>
                  <span>Online • Store Intelligence</span>
                </div>
              </div>
            </div>

            <div className="seller-ai-actions">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="seller-ai-btn-icon"
                aria-label="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="seller-ai-btn-icon"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="seller-ai-body">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`seller-ai-msg-row ${isAssistant ? 'msg-assistant' : 'msg-user'}`}
                >
                  {isAssistant && (
                    <div className="seller-ai-msg-avatar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
                      </svg>
                    </div>
                  )}

                  <div className="seller-ai-bubble-wrap">
                    <div className="seller-ai-bubble">
                      {renderFormattedMessage(msg.message)}
                    </div>

                    {/* Stats Metrics Cards */}
                    {isAssistant && Array.isArray(msg.statsCards) && msg.statsCards.length > 0 && (
                      <div className="seller-ai-stats-grid">
                        {msg.statsCards.map((st, sIdx) => (
                          <div key={sIdx} className="seller-stat-chip">
                            <span className="seller-stat-label">{st.label}</span>
                            <span className="seller-stat-val">{st.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Seller Listings Cards */}
                    {isAssistant && Array.isArray(msg.listingCards) && msg.listingCards.length > 0 && (
                      <div className="seller-ai-listings-carousel">
                        {msg.listingCards.map((item) => (
                          <div key={item.id || item._id} className="seller-listing-card">
                            {item.image && (
                              <div className="seller-listing-img-box">
                                <img src={item.image} alt={item.title} className="seller-listing-img" />
                                <span className={`seller-status-tag status-${(item.status || 'PENDING').toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </div>
                            )}
                            <div className="seller-listing-content">
                              <h5 className="seller-listing-title">{item.title}</h5>
                              <div className="seller-listing-price">
                                {formatListingPrice(item.price, item.currency || 'INR')}
                              </div>
                              <div className="seller-listing-metrics">
                                <span>👁️ {item.views || 0} views</span>
                                <span>💬 {item.inquiriesCount || 0} chats</span>
                              </div>
                              {item.rejectionReason && (
                                <div className="seller-listing-rejection">
                                  Note: {item.rejectionReason}
                                </div>
                              )}
                              <Link
                                to={item.url || `/listing/${item.id}`}
                                className="seller-listing-link"
                                onClick={() => setIsOpen(false)}
                              >
                                View Listing →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Portal Action Buttons */}
                    {isAssistant && Array.isArray(msg.actionLinks) && msg.actionLinks.length > 0 && (
                      <div className="seller-ai-action-links">
                        {msg.actionLinks.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate(link.url);
                            }}
                            className="seller-action-btn"
                          >
                            <span>{link.label}</span>
                            {link.count !== undefined && <span className="seller-action-count">{link.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="seller-ai-msg-row msg-assistant">
                <div className="seller-ai-msg-avatar">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
                  </svg>
                </div>
                <div className="seller-ai-bubble-wrap">
                  <div className="seller-ai-typing-bubble">
                    <span className="seller-typing-dot"></span>
                    <span className="seller-typing-dot"></span>
                    <span className="seller-typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {activeSuggestions.length > 0 && (
            <div className="seller-ai-chips-bar">
              {activeSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  className="seller-ai-chip"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="seller-ai-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="seller-ai-form"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about listings, sales, or moderation..."
                className="seller-ai-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="seller-ai-send-btn"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerAIChatbot;
