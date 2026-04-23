import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from '../types';

// NOTE: GoogleGenAI import removed - client-side API calls are a security risk
// For production, implement a backend proxy that handles API calls securely

const WELCOME_MESSAGE: Message = {
  role: 'model',
  text: "Hello! I'm José L. Saladin, owner of AAA On Time Electric. We provide professional electrical contracting across Florida with our own equipment - no delays, no subcontractors. How can I help you today?",
  timestamp: Date.now()
};

const FALLBACK_RESPONSES = [
  "I'd be happy to help with that! For a detailed quote, please call me at (786) 295-1748 or fill out our contact form.",
  "We handle those types of projects regularly. Give me a call at (786) 295-1748 to discuss the details.",
  "That sounds like a project we can definitely help with! We own all our equipment, so no rental delays. Call (786) 295-1748 for a free estimate.",
  "We offer 24/7 emergency service across Florida. For immediate assistance, please call (786) 295-1748.",
  "Great question! I'd recommend scheduling a site visit. Call (786) 295-1748 or fill out the contact form on our website.",
];

interface UseChatReturn {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

// Input sanitization for chat messages
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script[^>]*\b[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 500); // Limit input length
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const rateLimitRef = useRef<{ count: number; timestamp: number }>({ count: 0, timestamp: Date.now() });
  const conversationRef = useRef<Message[]>([WELCOME_MESSAGE]);

  // Keep conversation ref in sync
  useEffect(() => {
    conversationRef.current = messages;
  }, [messages]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    if (rateLimitRef.current.timestamp < windowStart) {
      rateLimitRef.current = { count: 1, timestamp: now };
      return true;
    }

    if (rateLimitRef.current.count >= 10) {
      return false;
    }

    rateLimitRef.current.count++;
    return true;
  }, []);

  const generateFallbackResponse = useCallback((userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('quote') || lowerMsg.includes('estimate')) {
      return "We offer free estimates! Every project is unique, so I prefer to assess the scope in person. Call me at (786) 295-1748 or fill out the contact form.";
    }

    if (lowerMsg.includes('emergency') || lowerMsg.includes('urgent') || lowerMsg.includes('now') || lowerMsg.includes('today')) {
      return "We provide 24/7 emergency service across Florida! Call me directly at (786) 295-1748 and I'll dispatch immediately.";
    }

    if (lowerMsg.includes('bucket') || lowerMsg.includes('truck') || lowerMsg.includes('high') || lowerMsg.includes('reach')) {
      return "Yes! We own 60ft articulating bucket trucks - no waiting for rentals. Perfect for parking lot lighting, signage, and overhead lines. Call (786) 295-1748.";
    }

    if (lowerMsg.includes('commercial') || lowerMsg.includes('business') || lowerMsg.includes('office')) {
      return "We specialize in commercial electrical work including panel upgrades, LED lighting design, and code compliance. We own all our equipment - no delays!";
    }

    if (lowerMsg.includes('industrial') || lowerMsg.includes('factory') || lowerMsg.includes('warehouse')) {
      return "Industrial projects are our specialty - high-voltage systems, machinery wiring, and underground infrastructure. 15+ years experience. Call (786) 295-1748.";
    }

    if (lowerMsg.includes('residential') || lowerMsg.includes('home') || lowerMsg.includes('house')) {
      return "While we primarily focus on commercial and industrial, we do take on select residential projects. Call (786) 295-1748 to discuss your needs.";
    }

    // Random fallback
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const sanitizedText = sanitizeInput(text);
    if (!sanitizedText) return;

    setLastUserMessage(sanitizedText);

    const userMsg: Message = {
      role: 'user',
      text: sanitizedText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    // Check rate limiting
    if (!checkRateLimit()) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'model',
          text: "I'm getting a lot of messages right now. For immediate assistance, please call me directly at (786) 295-1748!",
          timestamp: Date.now()
        }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // SECURITY: Client-side API calls removed to prevent API key exposure
    // For production, implement a backend proxy endpoint that:
    // 1. Receives chat requests from client
    // 2. Validates rate limits and inputs
    // 3. Calls Gemini API with secure server-side key
    // 4. Returns sanitized response to client

    // For now, use intelligent fallback responses
    setTimeout(() => {
      const fallbackResponse = generateFallbackResponse(sanitizedText);
      setMessages(prev => [...prev, {
        role: 'model',
        text: fallbackResponse,
        timestamp: Date.now()
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 400); // Random delay for realism
  }, [checkRateLimit, generateFallbackResponse]);

  const retryLastMessage = useCallback(async () => {
    // Clear error state first
    setError(null);

    if (lastUserMessage) {
      // Use the original lastUserMessage for retry (it should still be stored)
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setLastUserMessage(null);
    rateLimitRef.current = { count: 0, timestamp: Date.now() };
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  };
}
