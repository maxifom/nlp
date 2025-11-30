export type AnnotationType = {
  id: string;
  name: string;
  color: string;
  description?: string;
  shortcut?: string;
};

export type Mark = {
  id: string;
  typeId: string;
  startIndex: number;
  endIndex: number;
  text: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  zOrder?: number;
};

export type SelectionMode = 'character' | 'word' | 'sentence' | 'paragraph';

export type TextState = {
  originalText: string;
  marks: Mark[];
  selectedRange?: {
    start: number;
    end: number;
  };
};

export type HistoryEntry = {
  marks: Mark[];
  timestamp: number;
};

export type ExportFormat = 'json' | 'plain-text' | 'html';

export type AppState = {
  text: string;
  marks: Mark[];
  annotationTypes: AnnotationType[];
  selectedTypeId: string | null;
  selectionMode: SelectionMode;
  history: HistoryEntry[];
  historyIndex: number;
};
