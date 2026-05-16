import sanitizeHtml from "sanitize-html";

export function sanitizePlainText(text) {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}