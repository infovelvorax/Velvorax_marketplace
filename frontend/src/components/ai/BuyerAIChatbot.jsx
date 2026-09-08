import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { aiService } from '../../services/api/ai.service';
import { BuyerAIRobot } from './BuyerAIRobot';
import { BuyerAIMessage } from './BuyerAIMessage';
import { BuyerAISuggestions } from './BuyerAISuggestions';
import './BuyerAIChatbot.css';

const DEFAULT_SUGGESTIONS = [
  "two wheeler",
  "Find 2BHK apartments in Coimbatore",
  "Laptops under ₹50,000",
  "Bikes near Chennai"
];

const INITIAL_MESSAGE = {
  id: 'welcome-msg',
  sender: 'assistant',
  message: "Hi! I'm the **Velvorax Buyer AI**. I can search approved listings, compare properties, check vehicle specs, and help you discover great deals across India & worldwide.",
  listingCards: [],
  suggestions: DEFAULT_SUGGESTIONS
};

export function BuyerAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeSuggestions, setActiveSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Extract current listing ID context if user is currently on listing/property details page
  const listingIdMatch = location.pathname.match(/\/(?:listing|properties)\/([a-fA-F0-9]{24})/);
  const currentListingId = listingIdMatch ? listingIdMatch[1] : null;

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

  // Load conversation history on initial open
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await aiService.getBuyerAIHistory(conversationId);
        const payload = res?.data || res || {};
        if (isMounted && Array.isArray(payload?.messages) && payload.messages.length > 0) {
          if (payload.conversationId) setConversationId(payload.conversationId);
          setMessages(
            payload.messages.map((m) => ({
              id: m.id || m._id || 'msg_' + Math.random(),
              sender: m.sender,
              message: m.message,
              listingCards: m.metadata?.listingCards || m.metadata?.results || [],
              suggestions: m.metadata?.suggestions || []
            }))
          );
        }
      } catch (err) {
        // Silently continue if history unavailable
      }
    }

    if (isOpen && !conversationId) {
      loadHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle Animated Close
  const handleClose = () => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 280);
  };

  // Handle Toggle Open/Close
  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  // Send message through Buyer AI Pipeline
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
      const res = await aiService.chatWithBuyerAI({
        message: query,
        conversationId,
        currentListingId,
        currentRoute: location.pathname
      });

      // Normalize response data payload
      const responseData = res?.data || res || {};
      if (responseData.conversationId) {
        setConversationId(responseData.conversationId);
      }

      const safeListingCards = Array.isArray(responseData.listingCards)
        ? responseData.listingCards
        : Array.isArray(responseData.results)
        ? responseData.results
        : [];

      const replyMessage = responseData.message || (safeListingCards.length > 0
        ? `Found ${safeListingCards.length} matching listings:`
        : "I couldn't find any approved listings matching your requirements.");

      const safeSuggestions = Array.isArray(responseData.suggestions) && responseData.suggestions.length > 0
        ? responseData.suggestions
        : DEFAULT_SUGGESTIONS;

      setMessages([
        ...newMessages,
        {
          id: responseData.messageId || 'ast_' + Date.now(),
          sender: 'assistant',
          message: replyMessage,
          listingCards: safeListingCards,
          suggestions: safeSuggestions
        }
      ]);

      setActiveSuggestions(safeSuggestions);
    } catch (error) {
      console.error('Buyer AI Chat request error:', error);
      
      const isNetworkError = error?.isNetworkError || !navigator.onLine;
      const fallbackErrorMessage = isNetworkError
        ? "I'm unable to connect to the marketplace right now. Please check your internet connection and try again."
        : "I'm unable to access marketplace listings right now. Please try again shortly.";

      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          message: fallbackErrorMessage,
          listingCards: [],
          suggestions: DEFAULT_SUGGESTIONS
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
      await aiService.clearBuyerAIHistory(conversationId);
    } catch (err) {
      console.error('Clear history error:', err);
    }
    setMessages([
      {
        id: 'welcome-msg-cleared',
        sender: 'assistant',
        message: "Search filters and conversation cleared. What would you like to discover on Velvorax next?",
        listingCards: [],
        suggestions: DEFAULT_SUGGESTIONS
      }
    ]);
    setActiveSuggestions(DEFAULT_SUGGESTIONS);
  };

  return (
    <div className="buyer-ai-container">
      {/* Animated Floating Robot Trigger Button */}
      <BuyerAIRobot
        isOpen={isOpen && !isClosing}
        onClick={handleToggle}
        isThinking={loading}
        tooltip="Ask Buyer AI"
      />

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          className={`buyer-ai-modal ${isClosing ? 'is-closing' : 'is-opening'}`}
          role="dialog"
          aria-label="Velvorax Buyer AI Assistant"
          aria-modal="true"
        >
          {/* Header */}
          <div className="buyer-ai-header">
            <div className="buyer-ai-header-info">
              <div className="buyer-ai-avatar" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="buyer-ai-title-wrap">
                <h4>Velvorax Buyer AI</h4>
                <div className="buyer-ai-status">
                  <span className="buyer-ai-status-dot"></span>
                  <span>Online • Real-Time Search</span>
                </div>
              </div>
            </div>

            <div className="buyer-ai-actions">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="buyer-ai-btn-icon"
                aria-label="Clear conversation history"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Close chat"
                className="buyer-ai-btn-icon"
                aria-label="Close Buyer AI chat panel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="buyer-ai-body" role="log" aria-live="polite">
            {messages.map((msg) => (
              <BuyerAIMessage
                key={msg.id}
                message={msg}
                onSelectListing={handleClose}
              />
            ))}

            {/* AI Thinking Animation */}
            {loading && (
              <div className="buyer-ai-msg-row msg-assistant" aria-label="Buyer AI is searching">
                <div className="buyer-ai-msg-avatar" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="buyer-ai-bubble-wrap">
                  <div className="buyer-ai-typing-bubble">
                    <span className="buyer-typing-dot"></span>
                    <span className="buyer-typing-dot"></span>
                    <span className="buyer-typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {activeSuggestions.length > 0 && (
            <BuyerAISuggestions
              suggestions={activeSuggestions}
              onSelect={handleSendMessage}
              disabled={loading}
            />
          )}

          {/* Input Footer */}
          <div className="buyer-ai-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="buyer-ai-form"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find two wheelers, 2BHK, laptops, jobs..."
                className="buyer-ai-input"
                disabled={loading}
                aria-label="Ask Buyer AI a question or search for marketplace items"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="buyer-ai-send-btn"
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

export default BuyerAIChatbot;
