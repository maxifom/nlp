import type { Mark, AnnotationType } from "@/types/annotation";

export function createMark(
  text: string,
  typeId: string,
  startIndex: number,
  endIndex: number
): Mark {
  return {
    id: crypto.randomUUID(),
    typeId,
    startIndex,
    endIndex,
    text: text.substring(startIndex, endIndex),
    createdAt: Date.now(),
  };
}

export function removeMark(marks: Mark[], markId: string): Mark[] {
  return marks.filter((mark) => mark.id !== markId);
}

export function updateMark(marks: Mark[], markId: string, updates: Partial<Mark>): Mark[] {
  return marks.map((mark) =>
    mark.id === markId ? { ...mark, ...updates } : mark
  );
}

export function getMarksInRange(marks: Mark[], start: number, end: number): Mark[] {
  return marks.filter(
    (mark) =>
      (mark.startIndex >= start && mark.startIndex < end) ||
      (mark.endIndex > start && mark.endIndex <= end) ||
      (mark.startIndex <= start && mark.endIndex >= end)
  );
}

export function getMarksByType(marks: Mark[], typeId: string): Mark[] {
  return marks.filter((mark) => mark.typeId === typeId);
}

export function sortMarksByPosition(marks: Mark[]): Mark[] {
  return [...marks].sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    return a.endIndex - b.endIndex;
  });
}

export function getMarkStats(marks: Mark[], annotationTypes: AnnotationType[]) {
  const stats = new Map<string, { type: AnnotationType; count: number }>();

  for (const type of annotationTypes) {
    stats.set(type.id, { type, count: 0 });
  }

  for (const mark of marks) {
    const stat = stats.get(mark.typeId);
    if (stat) {
      stat.count++;
    }
  }

  return Array.from(stats.values())
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

export interface CategoryStats {
  categoryName: string;
  count: number;
  percentage: number;
}

export function getCategoryStats(marks: Mark[], categories: { name: string; typeIds: string[] }[]): CategoryStats[] {
  const totalMarks = marks.length;

  return categories.map(category => {
    const count = marks.filter(mark => category.typeIds.includes(mark.typeId)).length;
    return {
      categoryName: category.name,
      count,
      percentage: totalMarks > 0 ? (count / totalMarks) * 100 : 0,
    };
  });
}

export function convertMarksToOverlappingMarkup(
  text: string,
  marks: Mark[],
  annotationTypes: AnnotationType[]
) {
  const typeMap = new Map(annotationTypes.map((t) => [t.id, t]));

  return marks.map((mark) => {
    const type = typeMap.get(mark.typeId);
    return {
      min: mark.startIndex,
      max: mark.endIndex,
      style: type
        ? {
            before: `<span style="background-color: ${type.color}33; border-bottom: 2px solid ${type.color}; cursor: pointer;" data-mark-id="${mark.id}" title="${type.name}: ${mark.text}">`,
            after: "</span>",
          }
        : { before: "<span>", after: "</span>" },
    };
  });
}
