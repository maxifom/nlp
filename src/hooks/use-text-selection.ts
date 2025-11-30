import { useCallback, useRef } from "react";
import type { SelectionMode } from "@/types/annotation";
import { snapSelectionToMode } from "@/lib/text-processing";

// Helper function to get text offset within a container by walking DOM nodes
function getTextOffset(container: Node, targetNode: Node, targetOffset: number): number {
  let offset = 0;

  function traverse(node: Node): boolean {
    if (node === targetNode) {
      offset += targetOffset;
      return true;
    }

    // Skip elements that should be excluded from selection (like badge counts)
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.hasAttribute('data-exclude-from-selection')) {
        return false;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      offset += textLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverse(node.childNodes[i])) {
          return true;
        }
      }
    }

    return false;
  }

  traverse(container);
  return offset;
}

export function useTextSelection(text: string, selectionMode: SelectionMode) {
  const textRef = useRef<HTMLDivElement>(null);

  const getSelection = useCallback((): { start: number; end: number; text: string } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!textRef.current || !textRef.current.contains(range.commonAncestorContainer)) {
      return null;
    }

    // Properly calculate offsets by walking the DOM tree
    const start = getTextOffset(textRef.current, range.startContainer, range.startOffset);
    const end = getTextOffset(textRef.current, range.endContainer, range.endOffset);

    if (start === end) {
      return null;
    }

    const snapped = snapSelectionToMode(text, start, end, selectionMode);

    return {
      start: snapped.start,
      end: snapped.end,
      text: text.substring(snapped.start, snapped.end),
    };
  }, [text, selectionMode]);

  const clearSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  return {
    textRef,
    getSelection,
    clearSelection,
  };
}
