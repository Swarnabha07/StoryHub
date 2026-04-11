import { htmlToText } from "html-to-text";

/**
 * Calculates reading time in minutes based on content
 * @param {string} content - HTML or plain text
 * @param {number} wordsPerMinute - default 200 WPM
 * @returns {number} reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content || typeof content !== "string") return 0;

  // 1. Strip HTML tags if content is HTML
  const text = htmlToText(content, {
    wordwrap: false,
    selectors: [{ selector: "img", format: "skip" }],
  });

  // 2. Normalize whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return 0;

  // 3. Count words
  const words = cleanText.split(" ").length;

  // 4. Calculate reading time (in minutes)
  const readingTime = Math.ceil(words / wordsPerMinute);

  return readingTime;
}
