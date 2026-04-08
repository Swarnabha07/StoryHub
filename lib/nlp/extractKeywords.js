import stopWords from "./stopWords";
import { normalizeTag } from "./normalizeTag";

export function extractKeywords(text, title = "", limit = 5) {
  const wordMap = new Map();

  function process(source, boost = 1) {
    source
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .forEach((word) => {
        if (word.length < 3 || stopWords.has(word)) return;

        const score = (wordMap.get(word) || 0) + boost;
        wordMap.set(word, score);
      });
  }

  process(text, 1);
  process(title, 2); // title boost

  return [...wordMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => normalizeTag(word));
}
