import { useState, useRef, useCallback, useEffect } from 'react';
import { generateContentStream, DEFAULT_MODEL, sanitizePrompt, AKASHA_PERSONA } from '@/lib/ai';

export interface Message {
  role: 'user' | 'model';
  content: string;
  parts?: any[];
}

interface UseAIChatOptions {
  systemInstruction?: string;
  model?: string;
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (prompt: string, customSystemInstruction?: string) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const sanitized = sanitizePrompt(prompt);
    
    // Construct the full history for the API
    // We map our messages to the format expected by the API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    
    const currentPrompt = [...history, { role: 'user', parts: [{ text: sanitized }] }];
    
    const newUserMsg: Message = { role: 'user', content: sanitized };
    const newModelMsg: Message = { role: 'model', content: '' };
    
    setMessages(prev => [...prev, newUserMsg, newModelMsg]);

    let accumulated = '';
    try {
      const systemInstruction = customSystemInstruction || options.systemInstruction || AKASHA_PERSONA;
      const model = options.model || DEFAULT_MODEL;
      const stream = generateContentStream(currentPrompt, systemInstruction, abortControllerRef.current.signal, { model });

      for await (const chunk of stream) {
        accumulated += chunk;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: 'model', content: accumulated };
          }
          return updated;
        });
      }

      return accumulated;
    } catch (err: any) {
      if (err.name === 'AbortError') return '';
      console.error('AI Chat Error:', err);
      setError(err.message || '星辰暂时沉默了，请稍后再试。');
      // Keep user message but remove failed model message
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, options.systemInstruction]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
