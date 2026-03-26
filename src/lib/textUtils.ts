// Text utilities — ported from my-brand-nextjs/utils/textLengthReducer.ts

import { htmlToText } from "html-to-text";

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function htmlToPlainText(html: string): string {
  if (!html) {
    return "";
  }
  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
    ],
  });
  return text.trim();
}

/**
 * Generate a reading excerpt from HTML content
 */
export function generateExcerpt(
  htmlContent: string,
  maxLength: number = 160
): string {
  if (!htmlContent) return "";
  // Convert HTML to plain text
  const plainText = htmlToPlainText(htmlContent);
  return truncateText(plainText, maxLength);
}

/**
 * Estimate reading time from content
 */
export function estimateReadTime(content: string): string {
  if (!content) return "1 min read";
  const plainText = htmlToPlainText(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}
