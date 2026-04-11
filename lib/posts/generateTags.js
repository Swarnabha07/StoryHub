import { htmlToText } from "html-to-text";
import { extractKeywords } from "../nlp/extractKeywords";

export function generateTagsFromContent(html, title) {
  const text = htmlToText(html, {
    wordwrap: false,
  });

  return extractKeywords(text, title);
}
