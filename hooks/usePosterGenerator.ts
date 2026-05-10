import { useState, useCallback, RefObject } from 'react';
import { generatePosterImage } from '@/lib/exportImage';

export function usePosterGenerator() {
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  const handleGeneratePoster = useCallback(async (
    element: HTMLDivElement | null, 
    filename: string = 'akasha-journey'
  ) => {
    if (!element) return;
    setIsGeneratingPoster(true);
    try {
      // Small delay to ensure any UI updates are reflected
      await new Promise((resolve) => setTimeout(resolve, 100));
      const image = await generatePosterImage(element);
      const link = document.createElement("a");
      link.href = image;
      link.download = `${filename}-${Date.now()}.jpg`;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster:', err);
      throw err;
    } finally {
      setIsGeneratingPoster(false);
    }
  }, []);

  return { isGeneratingPoster, handleGeneratePoster };
}
