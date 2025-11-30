"use client";

import { useState, useEffect, useCallback } from "react";
import { Highlighter } from "lucide-react";
import type { Mark, AnnotationType, SelectionMode } from "@/types/annotation";
import { useTextSelection } from "@/hooks/use-text-selection";
import { MarkedText } from "./marked-text";
import { AnnotationPopup } from "./annotation-popup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TextEditorProps {
  text: string;
  marks: Mark[];
  annotationTypes: AnnotationType[];
  selectedTypeId: string | null;
  selectionMode: SelectionMode;
  onAddMark: (start: number, end: number) => void;
  onRemoveMark: (markId: string) => void;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onRegisterMarkFn?: (fn: () => void) => void;
  onRegisterSelectionFn?: (fn: () => { start: number; end: number } | null) => void;
  onRegisterTextContainerRef?: (ref: HTMLDivElement | null) => void;
}

export function TextEditor({
  text,
  marks,
  annotationTypes,
  selectedTypeId,
  selectionMode,
  onAddMark,
  onRemoveMark,
  onSelectionModeChange,
  onRegisterMarkFn,
  onRegisterSelectionFn,
  onRegisterTextContainerRef,
}: TextEditorProps) {
  const { textRef, getSelection, clearSelection } = useTextSelection(
    text,
    selectionMode
  );
  const [popupState, setPopupState] = useState<{
    marks: Array<{ mark: Mark; type: AnnotationType }>;
    position: { x: number; y: number };
  } | null>(null);

  const handleMarkText = useCallback(() => {
    if (!selectedTypeId) {
      alert("Пожалуйста, выберите тип аннотации");
      return;
    }

    const selection = getSelection();
    if (!selection) {
      alert("Пожалуйста, выделите текст");
      return;
    }

    onAddMark(selection.start, selection.end);
    // Keep selection so user can apply multiple metaprograms to same text
  }, [selectedTypeId, getSelection, onAddMark]);

  // Register functions with parent
  useEffect(() => {
    if (onRegisterMarkFn) {
      onRegisterMarkFn(handleMarkText);
    }
    if (onRegisterSelectionFn) {
      onRegisterSelectionFn(getSelection);
    }
    if (onRegisterTextContainerRef && textRef.current) {
      onRegisterTextContainerRef(textRef.current);
    }
  }, [onRegisterMarkFn, onRegisterSelectionFn, onRegisterTextContainerRef, handleMarkText, getSelection, textRef]);

  const typeMap = new Map(annotationTypes.map((t) => [t.id, t]));

  const handleMarkClick = (markId: string, event?: React.MouseEvent) => {
    const clickedMark = marks.find((m) => m.id === markId);
    if (!clickedMark) return;

    const type = typeMap.get(clickedMark.typeId);
    if (!type) return;

    // Find all marks at the same position
    const overlappingMarks = marks
      .filter(
        (m) =>
          m.startIndex <= clickedMark.startIndex &&
          m.endIndex >= clickedMark.endIndex
      )
      .map((m) => ({
        mark: m,
        type: typeMap.get(m.typeId)!,
      }))
      .filter((item) => item.type);

    if (event && overlappingMarks.length > 0) {
      setPopupState({
        marks: overlappingMarks,
        position: { x: event.clientX, y: event.clientY },
      });
    }
  };

  const handleMarkContextMenu = (
    marks: Array<{ mark: Mark; type: AnnotationType }>,
    event: React.MouseEvent
  ) => {
    setPopupState({
      marks,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const handleRemoveFromPopup = (markId: string) => {
    onRemoveMark(markId);
    // Update popup state to remove the deleted mark
    if (popupState) {
      const updatedMarks = popupState.marks.filter((m) => m.mark.id !== markId);
      if (updatedMarks.length === 0) {
        setPopupState(null);
      } else {
        setPopupState({ ...popupState, marks: updatedMarks });
      }
    }
  };

  const handleClosePopup = () => {
    setPopupState(null);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setPopupState(null);
    };

    if (popupState) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [popupState]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="selection-mode" className="text-sm">
              Режим выделения:
            </Label>
            <Select
              value={selectionMode}
              onValueChange={(value) =>
                onSelectionModeChange(value as SelectionMode)
              }
            >
              <SelectTrigger id="selection-mode" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="character">Символ</SelectItem>
                <SelectItem value="word">Слово</SelectItem>
                <SelectItem value="sentence">Предложение</SelectItem>
                <SelectItem value="paragraph">Абзац</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleMarkText}
            disabled={!selectedTypeId}
            size="sm"
          >
            <Highlighter className="mr-2 h-4 w-4" />
            Разметить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MarkedText
          text={text}
          marks={marks}
          annotationTypes={annotationTypes}
          onMarkClick={handleMarkClick}
          onMarkContextMenu={handleMarkContextMenu}
          textRef={textRef}
        />

        {popupState && (
          <AnnotationPopup
            marks={popupState.marks}
            onRemove={handleRemoveFromPopup}
            onClose={handleClosePopup}
            position={popupState.position}
          />
        )}
      </CardContent>
    </Card>
  );
}
