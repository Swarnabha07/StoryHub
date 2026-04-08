import { JSDOM } from "jsdom";
import { extractKeywords } from "../nlp/extractKeywords";

export function generateTagsFromContent(html, title) {
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent || "";

  return extractKeywords(text, title);
}
