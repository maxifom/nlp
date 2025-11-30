import type { SelectionMode } from "@/types/annotation";

export interface Token {
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'word' | 'punctuation' | 'whitespace';
}

export function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  // Updated regex to support Unicode word characters including Cyrillic, etc.
  // \p{L} matches any Unicode letter, \p{N} matches any Unicode number
  const regex = /([\p{L}\p{N}_]+)|([\p{P}\p{S}])|(\s+)/gu;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, word, punctuation, whitespace] = match;
    const startIndex = match.index;
    const endIndex = startIndex + fullMatch.length;

    if (word) {
      tokens.push({ text: word, startIndex, endIndex, type: 'word' });
    } else if (punctuation) {
      tokens.push({ text: punctuation, startIndex, endIndex, type: 'punctuation' });
    } else if (whitespace) {
      tokens.push({ text: whitespace, startIndex, endIndex, type: 'whitespace' });
    }
  }

  return tokens;
}

export function findSentenceBoundaries(text: string, index: number): { start: number; end: number } {
  const sentenceEndings = /[.!?]+[\s\n]/g;
  let start = 0;
  let end = text.length;

  let match;
  while ((match = sentenceEndings.exec(text)) !== null) {
    const endIndex = match.index + match[0].length;
    if (endIndex <= index) {
      start = endIndex;
    } else if (endIndex > index && match.index < end) {
      end = match.index + match[0].trimEnd().length;
      break;
    }
  }

  while (start < text.length && /\s/.test(text[start])) {
    start++;
  }

  return { start, end };
}

export function findParagraphBoundaries(text: string, index: number): { start: number; end: number } {
  const paragraphs = text.split(/\n\n+/);
  let currentIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphEnd = currentIndex + paragraph.length;
    if (index >= currentIndex && index <= paragraphEnd) {
      return {
        start: currentIndex,
        end: paragraphEnd,
      };
    }
    currentIndex = paragraphEnd + 2;
  }

  return { start: 0, end: text.length };
}

export function findWordBoundaries(text: string, index: number): { start: number; end: number } {
  const tokens = tokenizeText(text);

  // First, try to find a word that contains this index
  for (const token of tokens) {
    if (token.type === 'word' && index >= token.startIndex && index < token.endIndex) {
      return { start: token.startIndex, end: token.endIndex };
    }
  }

  // If we're at whitespace or punctuation, find the closest word
  // Check the word before this position
  let closestBefore: Token | null = null;
  let closestAfter: Token | null = null;

  for (const token of tokens) {
    if (token.type === 'word') {
      if (token.endIndex <= index && (!closestBefore || token.endIndex > closestBefore.endIndex)) {
        closestBefore = token;
      }
      if (token.startIndex >= index && (!closestAfter || token.startIndex < closestAfter.startIndex)) {
        closestAfter = token;
      }
    }
  }

  // Prefer the word before if index is at a boundary
  if (closestBefore && closestBefore.endIndex === index) {
    return { start: closestBefore.startIndex, end: closestBefore.endIndex };
  }

  // Otherwise prefer the word after
  if (closestAfter && closestAfter.startIndex === index) {
    return { start: closestAfter.startIndex, end: closestAfter.endIndex };
  }

  return { start: index, end: index };
}

export function snapSelectionToMode(
  text: string,
  startIndex: number,
  endIndex: number,
  mode: SelectionMode
): { start: number; end: number } {
  if (mode === 'character') {
    return { start: startIndex, end: endIndex };
  }

  if (mode === 'word') {
    const startBounds = findWordBoundaries(text, startIndex);

    // If the selection doesn't extend past the start word, return just that word
    if (endIndex <= startBounds.end) {
      return startBounds;
    }

    // Check if there are any actual word characters between the start word end and the selection end
    const textBetween = text.substring(startBounds.end, endIndex);
    const hasWordChars = /[\p{L}\p{N}_]/u.test(textBetween);

    if (!hasWordChars) {
      // Only whitespace/punctuation selected after the word, don't expand to next word
      return startBounds;
    }

    // Selection includes part of another word, expand to include the full word
    const endBounds = findWordBoundaries(text, Math.max(0, endIndex - 1));
    return { start: startBounds.start, end: endBounds.end };
  }

  if (mode === 'sentence') {
    const startBounds = findSentenceBoundaries(text, startIndex);
    const endBounds = findSentenceBoundaries(text, endIndex - 1);
    return { start: startBounds.start, end: Math.max(startBounds.end, endBounds.end) };
  }

  if (mode === 'paragraph') {
    const startBounds = findParagraphBoundaries(text, startIndex);
    const endBounds = findParagraphBoundaries(text, endIndex - 1);
    return { start: startBounds.start, end: Math.max(startBounds.end, endBounds.end) };
  }

  return { start: startIndex, end: endIndex };
}

export function getTextFromRange(text: string, start: number, end: number): string {
  return text.substring(start, end);
}
