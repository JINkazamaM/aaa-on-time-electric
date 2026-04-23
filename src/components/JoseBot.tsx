import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Zap, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';

interface JoseBotProps {
  forceOpen?: boolean;
}

const quickReplies = [
  "Emergency Response",
  "Commercial/Industrial",
  "Bucket Truck",
  "Free Estimate"
];

export default function JoseBot({ forceOpen = false }: JoseBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { messages, isTyping, sendMessage, clearMessages, error, retryLastMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Open logic - NO auto-start, user must initiate
  useEffect(() => {
    isMounted.current = true;

    if (forceOpen) setIsOpen(true);

    const handleOpenChat = () => {
      if (isMounted.current) setIsOpen(true);
    };

    document.addEventListener('open-jose-chat', handleOpenChat);

    return () => {
      isMounted.current = false;
      document.removeEventListener('open-jose-chat', handleOpenChat);
    };
  }, [forceOpen]);

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        if (isMounted.current && inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMounted.current) {
        setIsOpen(false);
      }
    };

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !isOpen || !chatContainerRef.current) return;

      const focusableElements = chatContainerRef.current.querySelectorAll<HTMLElement>(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  }, [input, isTyping, sendMessage]);

  const handleQuickReply = useCallback((reply: string) => {
    if (isTyping) return;
    sendMessage(reply);
  }, [isTyping, sendMessage]);

  const handleClear = useCallback(() => {
    clearMessages();
    setShowClearConfirm(false);
  }, [clearMessages]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowClearConfirm(false);
  }, []);

  const hasUnreadMessages = messages.length > 1 && !isOpen;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50" role="region" aria-label="Chat with Jose">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            className="mb-4 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-8rem)] bg-bg-surface border border-border-accent rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary/90 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm border-2 border-primary/30">
                  JLS
                </div>
                <div>
                  <h3 id="chat-title" className="font-bold text-sm leading-tight">José L. Saladin</h3>
                  <p className="text-[10px] uppercase tracking-wide text-white/70">
                    {error ? 'Connection Issue' : 'Online - Master Electrician'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Clear confirmation */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-500/10 border-b border-yellow-500/30 p-3 flex items-center justify-between"
                >
                  <span className="text-xs text-yellow-600">Clear all messages?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-base scrollbar-thin"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.map((msg, i) => (
                <div
                  key={`${msg.timestamp}-${i}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 px-4 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-bg-base font-bold rounded-tr-none shadow-lg'
                        : 'bg-bg-card border border-border-accent text-text-base rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text.split('\n').map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-card border border-border-accent p-3 px-4 rounded-xl rounded-tl-none animate-pulse text-xs text-text-muted font-bold uppercase tracking-widest">
                    José is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error message with retry */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 py-2 bg-red-500/10 border-t border-red-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle size={14} />
                      <span>Connection issue</span>
                    </div>
                    <button
                      onClick={retryLastMessage}
                      disabled={isTyping}
                      className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                    >
                      <RotateCcw size={12} />
                      Retry
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Replies */}
            <div className="p-3 flex gap-2 overflow-x-auto bg-bg-base border-t border-border-accent no-scrollbar shrink-0">
              {quickReplies.map(reply => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  disabled={isTyping}
                  className="whitespace-nowrap px-3 py-1.5 bg-bg-card border border-border-accent hover:border-primary text-text-base text-[10px] font-bold rounded-full transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-border-accent bg-bg-base flex gap-2 shrink-0"
            >
              <div className="flex-1 flex items-center bg-bg-surface border border-border-accent rounded-full px-4 py-2 group focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isTyping}
                  maxLength={500}
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-text-muted/50 disabled:cursor-not-allowed"
                  aria-label="Message input"
                />
                <span className="text-xs text-text-muted/50 ml-2">{input.length}/500</span>
                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="text-primary hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ml-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                  aria-label="Send message"
                >
                  <Zap size={18} fill="currentColor" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center transition-shadow hover:shadow-primary/50 group relative focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label={isOpen ? 'Close chat' : 'Open chat with José'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-bg-surface border border-border-accent text-text-base px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shadow-lg pointer-events-none">
            Chat with José
          </span>
        )}
        {!isOpen && hasUnreadMessages && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
            {messages.length - 1}
          </span>
        )}
      </motion.button>
    </div>
  );
}
