import { describe, it, expect } from 'vitest';
import { snapSelectionToMode } from './text-processing';

describe('snapSelectionToMode - word mode', () => {
  const text = 'вы мне позволите';
  // Indices:    0-2 3-6 7-16
  // "вы" is at 0-2
  // " " is at 2-3
  // "мне" is at 3-6
  // " " is at 6-7
  // "позволите" is at 7-16

  it('should select single word "вы" when selecting just "вы"', () => {
    const result = snapSelectionToMode(text, 0, 2, 'word');
    expect(result).toEqual({ start: 0, end: 2 });
    expect(text.substring(result.start, result.end)).toBe('вы');
  });

  it('should select single word "вы" when selecting "вы" with trailing space', () => {
    const result = snapSelectionToMode(text, 0, 3, 'word');
    expect(result).toEqual({ start: 0, end: 2 });
    expect(text.substring(result.start, result.end)).toBe('вы');
  });

  it('should select "вы мне" when selecting "вы м" (partial second word)', () => {
    const result = snapSelectionToMode(text, 0, 4, 'word');
    expect(result).toEqual({ start: 0, end: 6 });
    expect(text.substring(result.start, result.end)).toBe('вы мне');
  });

  it('should select single word "мне" when selecting just "мне"', () => {
    const result = snapSelectionToMode(text, 3, 6, 'word');
    expect(result).toEqual({ start: 3, end: 6 });
    expect(text.substring(result.start, result.end)).toBe('мне');
  });

  it('should select "вы мне" when selecting both words fully', () => {
    const result = snapSelectionToMode(text, 0, 6, 'word');
    expect(result).toEqual({ start: 0, end: 6 });
    expect(text.substring(result.start, result.end)).toBe('вы мне');
  });

  it('should select single word when starting mid-word', () => {
    const result = snapSelectionToMode(text, 1, 2, 'word');
    expect(result).toEqual({ start: 0, end: 2 });
    expect(text.substring(result.start, result.end)).toBe('вы');
  });

  it('should expand partial word selection to full word', () => {
    const result = snapSelectionToMode(text, 4, 5, 'word');
    expect(result).toEqual({ start: 3, end: 6 });
    expect(text.substring(result.start, result.end)).toBe('мне');
  });

  it('should handle selection in whitespace', () => {
    const result = snapSelectionToMode(text, 2, 3, 'word');
    expect(result).toEqual({ start: 0, end: 2 });
    expect(text.substring(result.start, result.end)).toBe('вы');
  });
});

describe('snapSelectionToMode - character mode', () => {
  const text = 'вы мне';

  it('should return exact selection in character mode', () => {
    const result = snapSelectionToMode(text, 0, 2, 'character');
    expect(result).toEqual({ start: 0, end: 2 });
  });

  it('should allow partial word selection in character mode', () => {
    const result = snapSelectionToMode(text, 1, 2, 'character');
    expect(result).toEqual({ start: 1, end: 2 });
  });
});
