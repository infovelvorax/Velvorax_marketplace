import './Messages.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { chatService } from '../../services/api/chat.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { cn } from '../../utils';

export const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvoId = searchParams.get('conversation');
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data || []);
      if (!activeConvoId && data && data.length > 0) {
        setSearchParams({ conversation: data[0]._id });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvoId) return;

    const fetchMessages = async () => {
      try {
        const found = conversations.find(c => c._id === activeConvoId);
        if (found) setActiveConversation(found);

        const msgs = await chatService.getMessages(activeConvoId);
        setMessages(msgs || []);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConvoId, conversations]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvoId || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await chatService.sendMessage(activeConvoId, { content: text });
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
      fetchConversations();
    } catch (err) {
      showToast('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (convo) => {
    if (!convo || !convo.participants) return { name: 'User' };
    return convo.participants.find(p => (p._id || p.id) !== user?._id) || convo.participants[0];
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xs text-[var(--text-primary)] transition-colors duration-200">
      <div className="flex h-full divide-x divide-[var(--border-primary)]">
        
        {/* Left Sidebar: Conversations List */}
        <div className={cn(
          "w-full sm:w-80 lg:w-96 flex flex-col bg-[var(--bg-secondary)] shrink-0",
          activeConvoId && "hidden sm:flex"
        )}>
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Direct Messages</h2>
            <span className="text-xs text-[var(--accent)] font-bold bg-[var(--bg-secondary)] px-2.5 py-0.5 rounded-full border border-[var(--border-primary)]">{conversations.length} Active</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {loadingList ? (
              <div className="py-12 flex justify-center"><Loader size="md" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[var(--text-secondary)]">
                No active conversations yet.
              </div>
            ) : (
              conversations.map(convo => {
                const other = getOtherParticipant(convo);
                const isSelected = convo._id === activeConvoId;
                return (
                  <button
                    key={convo._id}
                    onClick={() => setSearchParams({ conversation: convo._id })}
                    className={cn(
                      "w-full p-4.5 flex items-start gap-3.5 text-left transition-colors cursor-pointer",
                      isSelected ? "bg-[var(--bg-surface)] border-l-4 border-[var(--button-primary)] font-semibold" : "hover:bg-[var(--bg-surface)]"
                    )}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-[var(--border-primary)]">
                      {other?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[var(--text-primary)] text-[14px] truncate">{other?.name || 'User'}</span>
                        <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-medium">
                          {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      {convo.listingId && (
                        <div className="text-[12px] text-[var(--accent)] font-bold truncate mb-0.5">
                          🏷️ {convo.listingId.title}
                        </div>
                      )}
                      <p className="text-[13px] text-[var(--text-secondary)] truncate">
                        {typeof convo.lastMessage === 'string' 
                          ? convo.lastMessage 
                          : (convo.lastMessage?.text || 'Start conversation...')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col bg-[var(--bg-primary)] min-w-0",
          !activeConvoId && "hidden sm:flex items-center justify-center"
        )}>
          {activeConvoId && activeConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const other = getOtherParticipant(activeConversation);
                const otherPhone = other?.phone || '';
                const otherEmail = other?.email || '';
                const otherLoc = [other?.location?.city, other?.location?.country].filter(Boolean).join(', ');

                return (
                  <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-primary)] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <button 
                        onClick={() => setSearchParams({})} 
                        className="sm:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] mr-1 cursor-pointer"
                      >
                        &larr;
                      </button>
                      <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold flex items-center justify-center text-xs uppercase border border-[var(--border-primary)] shrink-0">
                        {other?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[var(--text-primary)] text-[15px] leading-tight">
                            {other?.name || 'User'}
                          </h3>
                          {other?.role && (
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-primary)]">
                              {other.role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-medium">
                          <span className="text-[var(--success)] font-semibold">● Active</span>
                          {otherLoc && <span>• 📍 {otherLoc}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct Phone Dial Button */}
                      {otherPhone && (
                        <a
                          href={`tel:${otherPhone}`}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Click to open device phone dialer"
                        >
                          <span>📞</span>
                          <span>{otherPhone}</span>
                        </a>
                      )}

                      {/* Direct Email Button */}
                      {otherEmail && (
                        <a
                          href={`mailto:${otherEmail}`}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Send direct email"
                        >
                          <span>✉️</span>
                          <span className="hidden md:inline">{otherEmail}</span>
                          <span className="md:hidden">Email</span>
                        </a>
                      )}

                      {/* Listing Snapshot Link */}
                      {activeConversation.listingId && (
                        <Link 
                          to={`/listing/${activeConversation.listingId._id || activeConversation.listingId}`}
                          className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] rounded-xl text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors truncate max-w-[200px] border border-[var(--border-primary)]"
                          title={activeConversation.listingId.title}
                        >
                          <span>🏷️</span>
                          <span className="truncate">{activeConversation.listingId.title}</span>
                          <span className="shrink-0">&rarr;</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-[13px] text-[var(--text-secondary)]">
                    No messages in this chat yet. Send a greeting to start chatting!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = (msg.senderId?._id || msg.senderId) === user?._id;
                    return (
                      <div 
                        key={msg._id}
                        className={cn(
                          "flex flex-col max-w-[80%] sm:max-w-[65%]",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "px-4.5 py-3 rounded-2xl text-[14px] leading-relaxed",
                            isMe 
                              ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-semibold rounded-br-none shadow-xs border border-[var(--button-primary)]" 
                              : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-bl-none shadow-2xs font-medium"
                          )}
                        >
                          {typeof (msg.content || msg.text) === 'string' 
                            ? (msg.content || msg.text) 
                            : (msg.text || msg.content || '')}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-primary)] flex gap-3">
                <input 
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)]"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] rounded-xl disabled:opacity-50 transition-all shadow-xs cursor-pointer border border-[var(--button-primary)]"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-[var(--text-secondary)] text-[14px]">
              Select a conversation on the left to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
