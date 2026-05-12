'use client';

import { useState, useCallback, useRef } from 'react';
import { useAIStream } from './useAIStream';
import { useJourney } from './useJourney';
import { Message, DivinationType } from '@/app/types/divination';
import { AKASHA_PERSONA } from '@/lib/prompts';

interface UseAIChatOptions {
  type: DivinationType;
  model?: string;
  systemInstruction?: string;
  initialMessages?: Message[];
}

export function useAIChat({ 
  type, 
  model, 
  systemInstruction = AKASHA_PERSONA,
  initialMessages = []
}: UseAIChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const { stream, isLoading, error, abort } = useAIStream({ model });
  const { addEntry, updateEntry } = useJourney();

  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
    abort();
  }, [abort]);

  const sendMessage = useCallback(async (
    prompt: string | any[],
    entryMetadata?: { title: string; summaryPrefix?: string; details: any },
    customSystemInstruction?: string
  ) => {
    const isFollowUp = messages.length > 0;
    const userMessageContent = typeof prompt === 'string' ? prompt : (Array.isArray(prompt) ? prompt[prompt.length - 1].content : '');

    // 1. Prepare new message state
    let newMessages: Message[];
    if (isFollowUp) {
      newMessages = [...messages, { role: 'user', content: userMessageContent } as Message];
    } else {
      // First message is usually the prompt which might be a large XML, 
      // but in UI we might want to show a cleaner version if it's a string.
      // However, usually first message from user isn't shown if it's a generated prompt.
      newMessages = messages; 
    }

    setMessages([...newMessages, { role: 'model', content: '' } as Message]);

    try {
      let fullResponse = "";
      const si = customSystemInstruction || systemInstruction;
      
      // If it's a follow-up, we pass the history
      const streamInput = isFollowUp 
        ? newMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
        : prompt;

      for await (const chunk of stream(streamInput as any, si)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse } as Message]);
      }

      const finalMessages = [...newMessages, { role: 'model', content: fullResponse } as Message];

      // 2. Persistence Logic
      if (!isFollowUp && entryMetadata) {
        const id = await addEntry({
          type,
          title: entryMetadata.title,
          summary: fullResponse.substring(0, 100) + '...',
          details: {
            ...entryMetadata.details,
            text: fullResponse,
            messages: finalMessages
          }
        });
        setCurrentEntryId(id || null);
      } else if (currentEntryId) {
        // For follow-ups, we update the existing entry
        // Combine all messages for the 'text' field if needed, or just update the messages array
        updateEntry(currentEntryId, {
          details: {
            // We need to spread existing details if we had access to them, 
            // but updateEntry in current useJourney implementation handles merging if we pass partial.
            // Actually, current updateEntry replaces the whole details object.
            // This is a known limitation that we'll address in the JourneyApp refactor.
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
