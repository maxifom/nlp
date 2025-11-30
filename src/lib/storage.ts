import type { Mark, AnnotationType } from "@/types/annotation";

const STORAGE_KEYS = {
  TEXT: "metaprogramms_text",
  MARKS: "metaprogramms_marks",
  ANNOTATION_TYPES: "metaprogramms_annotation_types",
} as const;

export function saveText(text: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT, text);
  } catch (error) {
    console.error("Failed to save text:", error);
  }
}

export function loadText(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.TEXT);
  } catch (error) {
    console.error("Failed to load text:", error);
    return null;
  }
}

export function saveMarks(marks: Mark[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));
    console.log(`Marks auto-saved to localStorage (${marks.length} marks)`);
  } catch (error) {
    console.error("Failed to save marks:", error);
  }
}

export function loadMarks(): Mark[] | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MARKS);
    const marks = data ? JSON.parse(data) : null;
    console.log(`Loaded ${marks?.length || 0} marks from localStorage`);
    return marks;
  } catch (error) {
    console.error("Failed to load marks:", error);
    return null;
  }
}

export function saveAnnotationTypes(types: AnnotationType[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOTATION_TYPES, JSON.stringify(types));
  } catch (error) {
    console.error("Failed to save annotation types:", error);
  }
}

export function loadAnnotationTypes(): AnnotationType[] | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOTATION_TYPES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load annotation types:", error);
    return null;
  }
}

export function exportToJSON(
  text: string,
  marks: Mark[],
  annotationTypes: AnnotationType[]
): string {
  return JSON.stringify(
    {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      text,
      marks,
      annotationTypes,
    },
    null,
    2
  );
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportedData {
  text: string;
  marks: Mark[];
  annotationTypes: AnnotationType[];
}

export function importFromJSON(jsonString: string): ImportedData {
  try {
    const data = JSON.parse(jsonString);

    if (!data.text || !Array.isArray(data.marks)) {
      throw new Error("Invalid JSON format: missing required fields");
    }

    return {
      text: data.text,
      marks: data.marks,
      annotationTypes: data.annotationTypes || [],
    };
  } catch (error) {
    throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
