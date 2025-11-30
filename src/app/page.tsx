"use client";

import { useEffect, useState, useRef } from "react";
import { Undo2, Redo2, BookOpen, Timer, BarChart3, Play, Square, RotateCcw } from "lucide-react";
import type { AnnotationType, SelectionMode, Mark } from "@/types/annotation";
import { useMarkingState } from "@/hooks/use-marking-state";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { NLP_METAPROGRAMS, SAMPLE_RUSSIAN_TEXT, MAIN_CATEGORIES } from "@/lib/nlp-metaprograms";
import {
  loadText,
  loadMarks,
  saveText,
  loadFromShareUrl,
  clearShareUrl,
} from "@/lib/storage";
import { TextInput } from "@/components/text-editor/text-input";
import { TextEditor } from "@/components/text-editor/text-editor";
import { MarksList } from "@/components/text-editor/marks-list";
import { GroupStats } from "@/components/text-editor/group-stats";
import { NLPTypeSelector } from "@/components/annotation-types/nlp-type-selector";
import { ExportMenu } from "@/components/text-editor/export-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("word");
  const [isLoaded, setIsLoaded] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(null);

  const {
    marks,
    canUndo,
    canRedo,
    addMark,
    removeMark,
    setMarks,
    undo,
    redo,
    clearAll,
  } = useMarkingState();

  useEffect(() => {
    console.log("Loading data from localStorage...");

    // First, check if there's shared data in the URL
    const sharedData = loadFromShareUrl();

    if (sharedData) {
      console.log("Loading from share URL:", {
        textLength: sharedData.text.length,
        marksCount: sharedData.marks.length,
      });

      setText(sharedData.text);
      setMarks(sharedData.marks);

      // Clear the URL hash to prevent re-loading on refresh
      clearShareUrl();

      console.log("Loaded shared data from URL");
    } else {
      // Load from localStorage
      const savedText = loadText();
      const savedMarks = loadMarks();

      console.log("Loaded:", {
        hasText: !!savedText,
        textLength: savedText?.length || 0,
        marksCount: savedMarks?.length || 0,
      });

      // Set text (use saved text or fallback to sample)
      if (savedText) {
        setText(savedText);
        console.log("Restored saved text");
      } else {
        setText(SAMPLE_RUSSIAN_TEXT);
        console.log("Using sample text (no saved text found)");
      }

      // Set marks
      if (savedMarks && savedMarks.length > 0) {
        setMarks(savedMarks);
        console.log(`Restored ${savedMarks.length} marks`);
      }
    }

    // Use static NLP metaprograms
    setAnnotationTypes(NLP_METAPROGRAMS);
    if (NLP_METAPROGRAMS.length > 0) {
      setSelectedTypeId(NLP_METAPROGRAMS[0].id);
    }

    setIsLoaded(true);
  }, [setMarks]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  // Auto-save text on changes with debouncing
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      saveText(text);
      console.log("Text auto-saved to localStorage");
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [text, isLoaded]);

  // Log on mount to verify loading
  useEffect(() => {
    if (isLoaded) {
      console.log("Data loaded from localStorage:", {
        text: text.substring(0, 50) + "...",
        marksCount: marks.length,
        typesCount: annotationTypes.length,
      });
    }
  }, [isLoaded]);

  const handleAddMark = (start: number, end: number) => {
    if (!selectedTypeId) return;
    addMark(text, selectedTypeId, start, end);
  };


  const handleTextChange = (newText: string) => {
    setText(newText);

    // Filter out annotations that are now outside the text boundaries
    // Keep annotations that are still within the new text length
    const validMarks = marks.filter(mark =>
      mark.startIndex < newText.length && mark.endIndex <= newText.length
    );

    // Only update marks if some were removed
    if (validMarks.length !== marks.length) {
      setMarks(validMarks);
    }

    handleStopTimer();
  };

  const handleImport = (data: { text: string; marks: Mark[] }) => {
    setText(data.text);
    setMarks(data.marks);
    handleStopTimer();
  };

  const handleStartTimer = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsTimerRunning(true);
    // Don't clear annotations - let user keep them
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setStartTime(null);
  };

  const handleResetTimer = () => {
    setStartTime(null);
    setElapsedTime(0);
    setIsTimerRunning(false);
    // Don't clear annotations - let user keep them
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filter marks and types based on selected group
  const getFilteredTypeIds = () => {
    if (!selectedGroupFilter) return null;
    const group = MAIN_CATEGORIES.find(g => g.name === selectedGroupFilter);
    return group ? group.typeIds : null;
  };

  const filteredTypeIds = getFilteredTypeIds();

  const filteredAnnotationTypes = filteredTypeIds
    ? annotationTypes.filter(type => filteredTypeIds.includes(type.id))
    : annotationTypes;

  const filteredMarks = filteredTypeIds
    ? marks.filter(mark => filteredTypeIds.includes(mark.typeId))
    : marks;

  // Store the mark and selection functions from TextEditor using refs
  const markSelectionFnRef = useRef<(() => void) | null>(null);
  const getSelectionFnRef = useRef<
    (() => { start: number; end: number } | null) | null
  >(null);
  const textEditorRef = useRef<HTMLElement | null>(null);

  const setMarkSelectionFn = (fn: () => void) => {
    markSelectionFnRef.current = fn;
  };

  const setGetSelectionFn = (fn: () => { start: number; end: number } | null) => {
    getSelectionFnRef.current = fn;
  };

  // Helper to restore text selection
  const restoreSelection = (start: number, end: number) => {
    if (!textEditorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    const textNodes: Text[] = [];

    // Find all text nodes, excluding those in badge elements
    const walker = document.createTreeWalker(
      textEditorRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip text nodes inside excluded elements (like badge counts)
          let parent = node.parentElement;
          while (parent && parent !== textEditorRef.current) {
            if (parent.hasAttribute('data-exclude-from-selection')) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    // Calculate positions
    let currentPos = 0;
    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    for (const textNode of textNodes) {
      const textLength = textNode.textContent?.length || 0;

      if (!startNode && currentPos + textLength >= start) {
        startNode = textNode;
        startOffset = start - currentPos;
      }

      if (!endNode && currentPos + textLength >= end) {
        endNode = textNode;
        endOffset = end - currentPos;
        break;
      }

      currentPos += textLength;
    }

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleMarkShortcut = () => {
    if (markSelectionFnRef.current) {
      markSelectionFnRef.current();
    }
  };

  const handleTypeSelectWithMark = (typeId: string) => {
    // Always set the selected type for visual feedback
    setSelectedTypeId(typeId);

    // If there's a selection, mark it immediately with the captured selection
    if (getSelectionFnRef.current) {
      const selection = getSelectionFnRef.current();
      if (selection) {
        // Mark immediately with the captured selection coordinates
        addMark(text, typeId, selection.start, selection.end);
        // Restore the selection so user can click more metaprograms
        setTimeout(() => restoreSelection(selection.start, selection.end), 0);
      }
    }
  };

  useKeyboardShortcuts([
    { key: "z", ctrl: true, callback: undo },
    { key: "y", ctrl: true, callback: redo },
    { key: "m", callback: handleMarkShortcut },
  ]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const annotationSpeed = elapsedTime > 0 ? (marks.length / elapsedTime) * 60 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Калибровка Метапрограмм НЛП</h1>
                <p className="text-sm text-muted-foreground">
                  Анализ текста с таймером и статистикой
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedGroupFilter || "all"}
                  onValueChange={(value) => setSelectedGroupFilter(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все группы</SelectItem>
                    {MAIN_CATEGORIES.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                title="Отменить (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                title="Повторить (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <ExportMenu
                text={text}
                marks={marks}
                annotationTypes={annotationTypes}
                onImport={handleImport}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Текст для анализа</h2>
              <TextInput text={text} onTextChange={handleTextChange} />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Аннотирование</h2>
              <TextEditor
                text={text}
                marks={filteredMarks}
                annotationTypes={filteredAnnotationTypes}
                selectedTypeId={selectedTypeId}
                selectionMode={selectionMode}
                onAddMark={handleAddMark}
                onRemoveMark={removeMark}
                onSelectionModeChange={setSelectionMode}
                onRegisterMarkFn={setMarkSelectionFn}
                onRegisterSelectionFn={setGetSelectionFn}
                onRegisterTextContainerRef={(ref) => (textEditorRef.current = ref)}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Список аннотаций</h2>
              <MarksList
                marks={filteredMarks}
                annotationTypes={filteredAnnotationTypes}
                onRemoveMark={removeMark}
                onClearAll={clearAll}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Статистика по группам</h2>
              <GroupStats
                marks={filteredMarks}
                annotationTypes={filteredAnnotationTypes}
                isFilterActive={selectedGroupFilter !== null}
              />
            </section>
          </div>

          <div className="sticky top-4 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6">
            <section>
              <NLPTypeSelector
                types={filteredAnnotationTypes}
                selectedTypeId={selectedTypeId}
                onSelectType={handleTypeSelectWithMark}
              />
            </section>

            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Статистика
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Время анализа:
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {formatTime(elapsedTime)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {selectedGroupFilter ? "Аннотаций (фильтр):" : "Всего аннотаций:"}
                    </span>
                    <Badge variant="outline">
                      {filteredMarks.length}
                      {selectedGroupFilter && ` / ${marks.length}`}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Скорость (анн/мин):
                    </span>
                    <Badge variant="outline">
                      {annotationSpeed.toFixed(1)}
                    </Badge>
                  </div>
                  {selectedGroupFilter && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <Filter className="h-3 w-3 inline mr-1" />
                      Активен фильтр по группе
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Символов в тексте:
                    </span>
                    <Badge variant="outline">{text.length}</Badge>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    💡 Совет: Используйте клавишу M для быстрой разметки выделенного текста
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>29 метапрограмм НЛП для калибровки навыков анализа текста</p>
            <div className="flex items-center gap-4">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Z</kbd>
              <span>Отменить</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">M</kbd>
              <span>Разметить</span>
              <span className="text-xs text-muted-foreground ml-4">• Авто-сохранение включено</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Timer Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
        <Card className="shadow-2xl border-2">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tabular-nums">
                {formatTime(elapsedTime)}
              </span>
              <div className="flex gap-1">
                {!isTimerRunning ? (
                  <Button
                    size="icon"
                    onClick={handleStartTimer}
                    className="h-8 w-8"
                    title="Старт"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={handleStopTimer}
                    className="h-8 w-8 animate-pulse"
                    title="Стоп"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleResetTimer}
                  className="h-8 w-8"
                  title="Сброс"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
