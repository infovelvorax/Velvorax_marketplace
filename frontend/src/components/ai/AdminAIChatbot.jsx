import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { aiService } from '../../services/api/ai.service';
import { FloatingRobotButton } from './FloatingRobotButton';
import './AdminAIChatbot.css';

/**
 * Format markdown-like bold text, tables, bullet points, and headers safely
 */
function renderFormattedAdminMessage(text = '') {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
    const cleanedLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

    // Parse bold **text**
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
        <h5 key={lineIdx} className="font-bold text-[14px] mt-2 mb-1 text-purple-400">
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

export function AdminAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'admin-welcome',
      sender: 'assistant',
      message: "### Velvorax Admin AI\n\nI can analyze real-time MongoDB metrics, query pending seller applications, check listing moderation queues, and generate executive summaries.",
      statsCards: [
        { label: 'Pending Sellers', value: 'Live', badge: 'Approvals' },
        { label: 'Moderation Queue', value: 'Live', badge: 'Review' }
      ],
      actionLinks: [
        { label: 'Seller Approvals', url: '/admin/sellers' },
        { label: 'Moderation Queue', url: '/admin/moderation' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeSuggestions, setActiveSuggestions] = useState([
    "How many sellers are waiting for approval?",
    "Marketplace Overview",
    "Listing Moderation Queue",
    "Top Sellers by Activity"
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

  // Load Admin conversation history on open
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await aiService.getAdminAIHistory(conversationId);
        if (isMounted && res?.data?.messages?.length > 0) {
          setConversationId(res.data.conversationId);
          setMessages(
            res.data.messages.map((m) => ({
              id: m.id,
              sender: m.sender,
              message: m.message,
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
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMessageId = 'usr_' + Date.now();
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        message: text
      }
    ];

    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await aiService.chatWithAdminAI({
        message: text,
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
          message: responseData.message || 'Executive query completed with live MongoDB data.',
          statsCards: responseData.statsCards || [],
          actionLinks: responseData.actionLinks || []
        }
      ]);
    } catch (error) {
      console.error('Admin AI Chat error:', error);
      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          message: "Unable to process administrative query. Ensure your admin session is active.",
          statsCards: [],
          actionLinks: [
            { label: 'Seller Approvals', url: '/admin/sellers' },
            { label: 'Moderation Queue', url: '/admin/moderation' }
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
      await aiService.clearAdminAIHistory(conversationId);
    } catch (err) {
      console.error('Clear history error:', err);
    }
    setMessages([
      {
        id: 'admin-welcome-cleared',
        sender: 'assistant',
        message: "Admin conversation cleared. How can I assist with marketplace management?",
        statsCards: [],
        actionLinks: []
      }
    ]);
  };

  return (
    <div className="admin-ai-container">
      {/* Animated Floating Robot Trigger */}
      <FloatingRobotButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        role="ADMIN"
        isThinking={loading}
        tooltip="Ask Admin AI"
      />

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="admin-ai-modal" role="dialog" aria-label="Velvorax Admin AI Chat">
          {/* Header */}
          <div className="admin-ai-header">
            <div className="admin-ai-header-info">
              <div className="admin-ai-avatar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="admin-ai-title-wrap">
                <h4>Velvorax Admin AI</h4>
                <div className="admin-ai-status">
                  <span className="admin-ai-status-dot"></span>
                  <span>MongoDB Live Analytics</span>
                </div>
              </div>
            </div>

            <div className="admin-ai-actions">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="admin-ai-btn-icon"
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
                className="admin-ai-btn-icon"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="admin-ai-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`admin-ai-message ${
                  msg.sender === 'user' ? 'admin-ai-msg-user' : 'admin-ai-msg-assistant'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="admin-ai-msg-avatar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                )}
                <div className="admin-ai-bubble-wrap">
                  <div className="admin-ai-bubble">
                    {renderFormattedAdminMessage(msg.message)}
                  </div>

                  {/* Live Stats Cards Grid */}
                  {Array.isArray(msg.statsCards) && msg.statsCards.length > 0 && (
                    <div className="admin-ai-stats-grid">
                      {msg.statsCards.map((card, idx) => (
                        <div key={idx} className="admin-ai-stat-card">
                          <div className="admin-ai-stat-header">
                            <span className="admin-ai-stat-label">{card.label}</span>
                            {card.badge && <span className="admin-ai-stat-badge">{card.badge}</span>}
                          </div>
                          <div className="admin-ai-stat-val">{card.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Navigation Links */}
                  {Array.isArray(msg.actionLinks) && msg.actionLinks.length > 0 && (
                    <div className="admin-ai-actions-wrap">
                      {msg.actionLinks.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(action.url);
                          }}
                          className="admin-ai-action-btn"
                        >
                          <span>{action.label}</span>
                          {action.count !== undefined && (
                            <span className="admin-ai-action-count">{action.count}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="admin-ai-message admin-ai-msg-assistant">
                <div className="admin-ai-msg-avatar">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="admin-ai-bubble-wrap">
                  <div className="admin-ai-typing-bubble">
                    <span className="admin-typing-dot"></span>
                    <span className="admin-typing-dot"></span>
                    <span className="admin-typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {activeSuggestions.length > 0 && (
            <div className="admin-ai-chips-bar">
              {activeSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  className="admin-ai-chip"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="admin-ai-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="admin-ai-form"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sellers, moderation, orders, revenue..."
                className="admin-ai-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="admin-ai-send-btn"
                aria-label="Send query"
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

export default AdminAIChatbot;
