import { useState, useCallback, useRef } from 'react';
import { generateContentStream, AKASHA_PERSONA } from '@/lib/ai';

export function useAIStream() {
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
    
    // Set a timeout of 30 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(new Error('Request timed out'));
      }
    }, 30000);

    try {
      const responseStream = generateContentStream(
        prompt as any,
        systemInstruction,
        abortControllerRef.current.signal
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
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return { stream, isLoading, error, abort };
}
