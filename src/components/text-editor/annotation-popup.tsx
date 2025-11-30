"use client";

import { X } from "lucide-react";
import type { Mark, AnnotationType } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AnnotationPopupProps {
  marks: Array<{ mark: Mark; type: AnnotationType }>;
  onRemove: (markId: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function AnnotationPopup({
  marks,
  onRemove,
  onClose,
  position,
}: AnnotationPopupProps) {
  if (marks.length === 0) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Card className="shadow-lg border-2 min-w-[300px] max-w-[400px]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {marks.length === 1 ? "Annotation" : `${marks.length} Annotations`}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {marks.map(({ mark, type }, idx) => (
              <div key={mark.id}>
                {idx > 0 && <Separator className="my-2" />}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="font-semibold text-sm">{type.name}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemove(mark.id)}
                      className="h-7 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "{mark.text}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Position: {mark.startIndex}–{mark.endIndex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
