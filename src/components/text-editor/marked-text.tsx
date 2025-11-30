"use client";

import { useMemo } from "react";
import type { Mark, AnnotationType } from "@/types/annotation";

interface MarkedTextProps {
  text: string;
  marks: Mark[];
  annotationTypes: AnnotationType[];
  onMarkClick?: (markId: string, event: React.MouseEvent) => void;
  onMarkContextMenu?: (
    marks: Array<{ mark: Mark; type: AnnotationType }>,
    event: React.MouseEvent
  ) => void;
  textRef?: React.RefObject<HTMLDivElement | null>;
}

export function MarkedText({
  text,
  marks,
  annotationTypes,
  onMarkClick,
  onMarkContextMenu,
  textRef,
}: MarkedTextProps) {
  const typeMap = useMemo(
    () => new Map(annotationTypes.map((t) => [t.id, t])),
    [annotationTypes]
  );

  const renderedContent = useMemo(() => {
    if (marks.length === 0) {
      return text;
    }

    const sortedMarks = [...marks].sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      return b.endIndex - a.endIndex;
    });

    const segments: Array<{
      text: string;
      marks: Array<{ mark: Mark; type: AnnotationType }>;
    }> = [];

    const breakpoints = new Set<number>([0, text.length]);
    sortedMarks.forEach((mark) => {
      breakpoints.add(mark.startIndex);
      breakpoints.add(mark.endIndex);
    });

    const positions = Array.from(breakpoints).sort((a, b) => a - b);

    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      const segmentText = text.substring(start, end);

      const segmentMarks = sortedMarks
        .filter((mark) => mark.startIndex <= start && mark.endIndex >= end)
        .map((mark) => ({
          mark,
          type: typeMap.get(mark.typeId)!,
        }))
        .filter((item) => item.type);

      segments.push({ text: segmentText, marks: segmentMarks });
    }

    return segments.map((segment, idx) => {
      if (segment.marks.length === 0) {
        return <span key={idx}>{segment.text}</span>;
      }

      const deepestMark = segment.marks[segment.marks.length - 1];
      const { mark, type } = deepestMark;

      const allColors = segment.marks.map((m) => m.type.color);
      const borderStyle =
        segment.marks.length > 1
          ? `2px solid ${type.color}`
          : `2px solid ${type.color}`;

      const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onMarkClick?.(mark.id, e);
      };

      const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (segment.marks.length === 1) {
          // Single annotation: remove directly on right-click
          onMarkClick?.(mark.id, e);
        } else {
          // Multiple annotations: show popup
          onMarkContextMenu?.(segment.marks, e);
        }
      };

      return (
        <span
          key={idx}
          data-mark-id={mark.id}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            backgroundColor: `${type.color}20`,
            borderBottom: borderStyle,
            cursor: "pointer",
            position: "relative",
          }}
          title={segment.marks.map((m) => m.type.name).join(" + ")}
          className="transition-colors hover:brightness-95"
        >
          {segment.marks.length > 1 && (
            <span
              data-exclude-from-selection="true"
              className="absolute -top-1 -right-1 text-xs bg-background border rounded-full w-4 h-4 flex items-center justify-center select-none"
              style={{ fontSize: "0.6rem" }}
              aria-hidden="true"
            >
              {segment.marks.length}
            </span>
          )}
          {segment.text}
        </span>
      );
    });
  }, [text, marks, typeMap, onMarkClick, onMarkContextMenu]);

  return (
    <div
      ref={textRef}
      className="whitespace-pre-wrap font-mono text-sm leading-relaxed select-text p-4 bg-muted/30 rounded-lg border min-h-[400px]"
    >
      {renderedContent}
    </div>
  );
}
