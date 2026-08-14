/**
 * Strips XML-like tags (e.g., <thinking>, <execute>, [SOUL_MOTTO]) 
 * and Markdown symbols to return clean plain text.
 * Useful for summaries and compact UI elements.
 */
export function cleanMysticContent(text: string): string {
  if (!text) return "";

  return text
    // Remove XML-like tags and their contents (including unclosed tags at the end of stream)
    .replace(/<search_results>[\s\S]*?(?:<\/search_results>|$)/gi, '')
    .replace(/<result>[\s\S]*?(?:<\/result>|$)/gi, '')
    .replace(/<search>[\s\S]*?(?:<\/search>|$)/gi, '')
    .replace(/<grounding>[\s\S]*?(?:<\/grounding>|$)/gi, '')
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/gi, '')
    .replace(/<thought>[\s\S]*?(?:<\/thought>|$)/gi, '')
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/<execute>[\s\S]*?(?:<\/execute>|$)/gi, '')
    .replace(/<details>[\s\S]*?(?:<\/details>|$)/gi, '')
    .replace(/<mystic_association>[\s\S]*?(?:<\/mystic_association>|$)/gi, '')

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

/**
 * Safely parses JSON returned by AI models.
 * Handles markdown code block wrapping, leading/trailing garbage, trailing commas,
 * and recovers key fields via regex if the JSON is malformed.
 */
export function safeParseAIJSON<T = any>(text: string, fallbackValue: T = {} as T): T {
  if (!text) return fallbackValue;

  let cleaned = text.trim();

  // 1. Strip markdown code block wrappers
  cleaned = cleaned.replace(/```json|```/gi, '').trim();

  // 2. Locate the first '{' and last '}' to isolate JSON block if there is leading/trailing text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 3. Try standard JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (parseError) {
    // 4. Try basic cleaning: remove trailing commas inside arrays/objects before brackets
    try {
      const fixedCommas = cleaned
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      return JSON.parse(fixedCommas) as T;
    } catch (commaError) {
      // 5. Try regex field recovery for common fields in the application if fallbackValue is a valid object
      if (fallbackValue && typeof fallbackValue === 'object' && !Array.isArray(fallbackValue)) {
        try {
          const result: any = { ...fallbackValue };
          const keys = Object.keys(fallbackValue);
          let matchedAny = false;

          for (const key of keys) {
            const stringRegex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*[,}]|\\s*"\\w+")`, 'i');
            const strMatch = cleaned.match(stringRegex);
            if (strMatch) {
              result[key] = strMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
              matchedAny = true;
              continue;
            }

            const arrayRegex = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i');
            const arrMatch = cleaned.match(arrayRegex);
            if (arrMatch) {
              try {
                const arrayItems = arrMatch[1]
                  .split(',')
                  .map(item => {
                    const itemMatch = item.match(/"([\s\S]*?)"/);
                    return itemMatch ? itemMatch[1] : item.trim().replace(/^['"]|['"]$/g, '');
                  })
                  .filter(item => item !== "");
                result[key] = arrayItems;
                matchedAny = true;
              } catch (e) {}
            }
          }

          if (matchedAny) {
            return result as T;
          }
        } catch (e) {
          // Fall through to returning fallbackValue
        }
      }

      return fallbackValue;
    }
  }
}
