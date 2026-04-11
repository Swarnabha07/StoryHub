import { htmlToText } from "html-to-text";

export function generateExcerpt(html, maxLength = 200) {
  if (!html) return "";

  // Remove HTML tags
  const text = htmlToText(html, {
    wordwrap: false,
  });

  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();

  // Trim length
  return cleanText.length > maxLength
    ? cleanText.slice(0, maxLength) + "..."
    : cleanText;
}
