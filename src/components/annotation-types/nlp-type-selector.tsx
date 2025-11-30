"use client";

import type { AnnotationType } from "@/types/annotation";
import {
  METAPROGRAM_CATEGORIES,
  type CategoryStructure,
} from "@/lib/nlp-metaprograms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NLPTypeSelectorProps {
  types: AnnotationType[];
  selectedTypeId: string | null;
  onSelectType: (typeId: string) => void;
}

export function NLPTypeSelector({
  types,
  selectedTypeId,
  onSelectType,
}: NLPTypeSelectorProps) {
  const typeMap = new Map(types.map((t) => [t.id, t]));

  // Check if category has any available types
  const hasAvailableTypes = (category: CategoryStructure): boolean => {
    if (category.types) {
      return category.types.some(type => typeMap.has(type.id));
    }
    if (category.subcategories) {
      return category.subcategories.some(sub => hasAvailableTypes(sub));
    }
    return false;
  };

  const renderCategory = (
    category: CategoryStructure,
    level: number = 0
  ): JSX.Element | null => {
    // Skip categories with no available types
    if (!hasAvailableTypes(category)) {
      return null;
    }

    const paddingClass = level === 0 ? "" : level === 1 ? "ml-3" : "ml-6";
    const headingSize =
      level === 0
        ? "text-sm font-semibold text-foreground"
        : level === 1
          ? "text-sm font-medium text-muted-foreground"
          : "text-xs font-medium text-muted-foreground";

    return (
      <div key={category.name} className={cn("space-y-2", paddingClass)}>
        <h3 className={headingSize}>{category.name}</h3>

        {category.types && (
          <div className="flex flex-wrap gap-2">
            {category.types.map((type) => {
              const fullType = typeMap.get(type.id);
              if (!fullType) return null;

              return (
                <Button
                  key={type.id}
                  variant={
                    selectedTypeId === type.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onSelectType(type.id)}
                  className={cn(
                    "relative text-xs",
                    selectedTypeId === type.id && "ring-2 ring-offset-2"
                  )}
                  style={{
                    borderColor: type.color,
                    backgroundColor:
                      selectedTypeId === type.id
                        ? type.color
                        : "transparent",
                    color:
                      selectedTypeId === type.id ? "white" : type.color,
                  }}
                >
                  <div
                    className="absolute left-1.5 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        selectedTypeId === type.id ? "white" : type.color,
                    }}
                  />
                  <span className="ml-3">{type.name}</span>
                </Button>
              );
            })}
          </div>
        )}

        {category.subcategories && (
          <div className="space-y-3 mt-3">
            {category.subcategories.map((subcat) =>
              renderCategory(subcat, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Метапрограммы НЛП</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {METAPROGRAM_CATEGORIES.map((category) =>
            renderCategory(category, 0)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
