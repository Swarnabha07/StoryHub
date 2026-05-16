import sanitizeHtml from "sanitize-html";

export function sanitizePostHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "br",
    ],

    allowedAttributes: {
      a: ["href"],
    },

    allowedSchemes: ["http", "https", "mailto"],

    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
