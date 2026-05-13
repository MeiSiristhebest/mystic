/**
 * Strips XML-like tags (e.g., <thinking>, <execute>, [SOUL_MOTTO]) 
 * and Markdown symbols to return clean plain text.
 * Useful for summaries and compact UI elements.
 */
export function cleanMysticContent(text: string): string {
  if (!text) return "";

  return text
    // Remove XML-like tags and their contents (including unclosed tags at the end of stream)
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
    .replace(/<execute>[\s\S]*?(?:<\/execute>|$)/g, '')
    .replace(/<mystic_association>[\s\S]*?(?:<\/mystic_association>|$)/g, '')
    // Remove [SOUL_MOTTO] tags
    .replace(/\[SOUL_MOTTO\][\s\S]*?(?:\[\/SOUL_MOTTO\]|$)/g, '')
    // Remove Markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}/g, '')
    .replace(/_{1,3}/g, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up multiple spaces and newlines
    .replace(/\n{2,}/g, '\n')
    .replace(/ {2,}/g, ' ')
    .trim();
}
