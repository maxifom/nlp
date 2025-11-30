import { useCallback, useReducer, useEffect, useState } from "react";
import type { Mark, AnnotationType, HistoryEntry } from "@/types/annotation";
import { createMark, removeMark, updateMark } from "@/lib/mark-operations";
import { saveMarks } from "@/lib/storage";

type Action =
  | { type: "ADD_MARK"; mark: Mark }
  | { type: "REMOVE_MARK"; markId: string }
  | { type: "UPDATE_MARK"; markId: string; updates: Partial<Mark> }
  | { type: "SET_MARKS"; marks: Mark[] }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_ALL" };

interface State {
  marks: Mark[];
  history: HistoryEntry[];
  historyIndex: number;
}

const MAX_HISTORY = 50;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_MARK": {
      const newMarks = [...state.marks, action.mark];
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        { marks: newMarks, timestamp: Date.now() },
      ].slice(-MAX_HISTORY);
      return {
        marks: newMarks,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "REMOVE_MARK": {
      const newMarks = removeMark(state.marks, action.markId);
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        { marks: newMarks, timestamp: Date.now() },
      ].slice(-MAX_HISTORY);
      return {
        marks: newMarks,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "UPDATE_MARK": {
      const newMarks = updateMark(state.marks, action.markId, action.updates);
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        { marks: newMarks, timestamp: Date.now() },
      ].slice(-MAX_HISTORY);
      return {
        marks: newMarks,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "SET_MARKS": {
      return {
        marks: action.marks,
        history: [{ marks: action.marks, timestamp: Date.now() }],
        historyIndex: 0,
      };
    }

    case "UNDO": {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          marks: state.history[newIndex].marks,
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          marks: state.history[newIndex].marks,
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case "CLEAR_ALL": {
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        { marks: [], timestamp: Date.now() },
      ].slice(-MAX_HISTORY);
      return {
        marks: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    default:
      return state;
  }
}

export function useMarkingState(initialMarks: Mark[] = []) {
  const [state, dispatch] = useReducer(reducer, {
    marks: initialMarks,
    history: [{ marks: initialMarks, timestamp: Date.now() }],
    historyIndex: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Auto-save marks, but skip the first save to prevent overwriting loaded data
  useEffect(() => {
    if (!isInitialized) return; // Skip the initial save
    saveMarks(state.marks);
  }, [state.marks, isInitialized]);

  const addMark = useCallback(
    (text: string, typeId: string, start: number, end: number) => {
      const mark = createMark(text, typeId, start, end);
      dispatch({ type: "ADD_MARK", mark });
      return mark;
    },
    []
  );

  const removeMarkById = useCallback((markId: string) => {
    dispatch({ type: "REMOVE_MARK", markId });
  }, []);

  const updateMarkById = useCallback((markId: string, updates: Partial<Mark>) => {
    dispatch({ type: "UPDATE_MARK", markId, updates });
  }, []);

  const setMarks = useCallback((marks: Mark[]) => {
    dispatch({ type: "SET_MARKS", marks });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  return {
    marks: state.marks,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    addMark,
    removeMark: removeMarkById,
    updateMark: updateMarkById,
    setMarks,
    undo,
    redo,
    clearAll,
  };
}
