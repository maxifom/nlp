"use client";

import { Trash2, List } from "lucide-react";
import type { Mark, AnnotationType } from "@/types/annotation";
import { getMarkStats, sortMarksByPosition } from "@/lib/mark-operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarksListProps {
  marks: Mark[];
  annotationTypes: AnnotationType[];
  onRemoveMark: (markId: string) => void;
  onClearAll: () => void;
}

export function MarksList({
  marks,
  annotationTypes,
  onRemoveMark,
  onClearAll,
}: MarksListProps) {
  const sortedMarks = sortMarksByPosition(marks);
  const stats = getMarkStats(marks, annotationTypes);
  const typeMap = new Map(annotationTypes.map((t) => [t.id, t]));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Annotations ({marks.length})
          </CardTitle>
          {marks.length > 0 && (
            <Button variant="destructive" size="sm" onClick={onClearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.map(({ type, count }) => (
              <Badge
                key={type.id}
                variant="outline"
                style={{ borderColor: type.color, color: type.color }}
              >
                {type.name}: {count}
              </Badge>
            ))}
          </div>
        )}

        {sortedMarks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No annotations yet. Select text and mark it to get started.
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-2">
              {sortedMarks.map((mark) => {
                const type = typeMap.get(mark.typeId);
                if (!type) return null;

                return (
                  <Card key={mark.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: type.color }}
                            />
                            <span className="font-semibold text-sm">
                              {type.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({mark.startIndex}–{mark.endIndex})
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{mark.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMark(mark.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
