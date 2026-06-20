import { useState, useCallback, useRef, useEffect } from 'react';
import { generateContentStream, AKASHA_PERSONA, AIProvider } from '@/lib/ai';

export function useAIStream(options: { model?: string, config?: any, provider?: AIProvider, timeoutMs?: number } = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(async function* (
    prompt: string | unknown[],
    systemInstruction: string = AKASHA_PERSONA
  ) {
    setIsLoading(true);
    setError(null);

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    // Set dynamic timeout (fallback to 120 seconds)
    const timeoutMs = options.timeoutMs || 120000;
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(new Error('Request timed out'));
      }
    }, timeoutMs);

    try {
      const responseStream = generateContentStream(
        prompt as any,
        systemInstruction,
        abortControllerRef.current.signal,
        { model: options.model, provider: options.provider, ...options.config }
      );

      for await (const chunk of responseStream) {
        yield chunk;
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request timed out')) {
        console.log('Stream aborted or timed out');
        setError('请求超时或被取消，请稍后再试。');
      } else {
        console.error('Stream error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during streaming');
        throw err;
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [options.model, options.config, options.provider, options.timeoutMs]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { stream, isLoading, error, abort };
}
