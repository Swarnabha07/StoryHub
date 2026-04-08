import { JSDOM } from "jsdom";

export function generateExcerpt(html, maxLength = 200) {
  if (!html) return "";

  // Remove HTML tags
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent || "";

  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();

  // Trim length
  return cleanText.length > maxLength
    ? cleanText.slice(0, maxLength) + "..."
    : cleanText;
}
