export async function generatePosterImage(element: HTMLElement): Promise<string> {
  try {
    const htmlToImage = await import('html-to-image');
    // 1. Add exporting class to body to trigger CSS overrides
    document.body.classList.add('is-exporting');

    // Wait for browser to apply styles and load images
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Generate image directly from the element using html-to-image
    // Call it once to ensure all assets are loaded and cached
    await htmlToImage.toJpeg(element, {
      pixelRatio: 1,
      style: { transform: 'none', maxHeight: 'none', overflow: 'visible' },
    });

    // Call it again for the actual high-quality export
    const dataUrl = await htmlToImage.toJpeg(element, {
      backgroundColor: '#1a0f0a',
      pixelRatio: 2,
      quality: 0.95,
      style: {
        transform: 'none',
        maxHeight: 'none',
        overflow: 'visible',
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating poster:', error);
    throw error;
  } finally {
    // 3. Clean up
    document.body.classList.remove('is-exporting');
  }
}
