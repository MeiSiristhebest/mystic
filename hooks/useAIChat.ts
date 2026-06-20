'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAIStream } from './useAIStream';
import { useJourney } from './useJourney';
import { Message, DivinationType } from '@/app/types/divination';
import { AKASHA_PERSONA } from '@/lib/prompts';
import { AIProvider } from '@/lib/ai';

interface UseAIChatOptions {
  type: DivinationType;
  model?: string;
  systemInstruction?: string;
  initialMessages?: Message[];
  provider?: AIProvider;
}

export function useAIChat({ 
  type, 
  model, 
  systemInstruction = AKASHA_PERSONA,
  initialMessages = [],
  provider
}: UseAIChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const { stream, isLoading, error, abort } = useAIStream({ model, provider });
  const { addEntry, updateEntry } = useJourney();

  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
    abort();
  }, [abort]);

  const sendMessage = useCallback(async (
    prompt: string | any[],
    entryMetadata?: { title: string; summaryPrefix?: string; details: any },
    customSystemInstruction?: string,
    displayPrompt?: string
  ) => {
    const isFollowUp = messages.length > 0;
    const rawContent = typeof prompt === 'string' ? prompt : (Array.isArray(prompt) ? prompt[prompt.length - 1].content : '');
    const userMessageContent = displayPrompt !== undefined ? displayPrompt : rawContent;

    // 1. Prepare new message state
    let newMessages: Message[];
    if (isFollowUp) {
      newMessages = [...messages, { role: 'user', content: userMessageContent } as Message];
    } else {
      newMessages = messages; 
    }

    setMessages([...newMessages, { role: 'model', content: '' } as Message]);

    try {
      let fullResponse = "";
      const si = customSystemInstruction || systemInstruction;
      
      // If it's a follow-up, we pass the history to the model, but for the LAST user message, we pass the raw content (with context pins)
      let streamInput: any;
      if (isFollowUp) {
        streamInput = newMessages.map((m, idx) => {
          if (idx === newMessages.length - 1) {
            return { role: m.role, parts: [{ text: rawContent }] };
          }
          return { role: m.role, parts: [{ text: m.content }] };
        });
      } else {
        streamInput = prompt;
      }

      let lastUpdateTime = Date.now();
      for await (const chunk of stream(streamInput as any, si)) {
        fullResponse += chunk;
        const now = Date.now();
        if (now - lastUpdateTime > 60) {
          setMessages([...newMessages, { role: 'model', content: fullResponse } as Message]);
          lastUpdateTime = now;
        }
      }
      // 确保流束结束时最后一帧全量渲染
      setMessages([...newMessages, { role: 'model', content: fullResponse } as Message]);

      const finalMessages = [...newMessages, { role: 'model', content: fullResponse } as Message];

      // 2. Persistence Logic
      if (!isFollowUp && entryMetadata) {
        const { cleanMysticContent } = await import('@/lib/utils');
        const cleanSummary = cleanMysticContent(fullResponse);
        
        const id = await addEntry({
          type,
          title: entryMetadata.title,
          summary: cleanSummary.substring(0, 150) + (cleanSummary.length > 150 ? '...' : ''),
          details: {
            ...entryMetadata.details,
            text: fullResponse,
            messages: finalMessages
          }
        });
        setCurrentEntryId(id || null);
      } else if (currentEntryId) {
        // For follow-ups, update the existing entry with clean messages
        updateEntry(currentEntryId, {
          details: {
            type,
            messages: finalMessages
          } as any
        });
      }

      return fullResponse;
    } catch (err) {
      console.error('Chat error:', err);
      throw err;
    }
  }, [messages, currentEntryId, stream, addEntry, updateEntry, systemInstruction, type]);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    messages,
    setMessages,
    sendMessage,
    isLoading,
    isStreaming: isLoading, // Alias for consistency
    error,
    abort,
    resetChat,
    currentEntryId,
    setCurrentEntryId
  };
}
