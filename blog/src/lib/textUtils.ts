// Text utilities — ported from my-brand-nextjs/utils/textLengthReducer.ts

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate a reading excerpt from HTML content
 */
export function generateExcerpt(
  htmlContent: string,
  maxLength: number = 160
): string {
  if (!htmlContent) return "";
  // Strip HTML tags
  const plainText = htmlContent.replace(/<[^>]*>/g, "").trim();
  return truncateText(plainText, maxLength);
}

/**
 * Estimate reading time from content
 */
export function estimateReadTime(content: string): string {
  if (!content) return "1 min read";
  const plainText = content.replace(/<[^>]*>/g, "");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}
