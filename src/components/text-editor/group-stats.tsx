"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Mark, AnnotationType } from "@/types/annotation";
import { getCategoryStats } from "@/lib/mark-operations";
import { MAIN_CATEGORIES } from "@/lib/nlp-metaprograms";
import { Card, CardContent } from "@/components/ui/card";

interface GroupStatsProps {
  marks: Mark[];
  annotationTypes: AnnotationType[];
  isFilterActive?: boolean;
}

export function GroupStats({ marks, annotationTypes, isFilterActive = false }: GroupStatsProps) {
  const categoryStats = getCategoryStats(marks, MAIN_CATEGORIES);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter out groups with zero count when filter is active
  const displayedStats = isFilterActive
    ? categoryStats.filter(stat => stat.count > 0)
    : categoryStats;

  const toggleGroup = (categoryName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedGroups(newExpanded);
  };

  // Group metaprograms by category
  const getMetaprogramsForCategory = (categoryName: string) => {
    const category = MAIN_CATEGORIES.find(c => c.name === categoryName);
    if (!category) return [];

    return annotationTypes.filter(type => category.typeIds.includes(type.id));
  };

  // Count annotations for a specific type
  const getCountForType = (typeId: string) => {
    return marks.filter(mark => mark.typeId === typeId).length;
  };

  const totalMarks = marks.length;

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        {marks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Аннотаций пока нет. Начните размечать текст, чтобы увидеть статистику по группам.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedStats.map((stat) => {
                const isExpanded = expandedGroups.has(stat.categoryName);
                const metaprograms = getMetaprogramsForCategory(stat.categoryName);
                const metaprogramsWithCounts = metaprograms
                  .map(type => ({
                    type,
                    count: getCountForType(type.id),
                  }))
                  .sort((a, b) => b.count - a.count);

                return (
                  <div key={stat.categoryName} className="space-y-2 border rounded-lg p-3">
                    <div
                      className="cursor-pointer select-none"
                      onClick={() => toggleGroup(stat.categoryName)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">{stat.categoryName}</span>
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">
                          {stat.count} ({stat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 flex-shrink-0"></div>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 pt-2 border-t">
                        {metaprogramsWithCounts.map(({ type, count }) => {
                          const percentage = totalMarks > 0 ? (count / totalMarks) * 100 : 0;
                          return (
                            <div key={type.id} className="space-y-1 pl-6">
                              <div className="flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: type.color }}
                                  />
                                  <span className="text-muted-foreground truncate">{type.name}</span>
                                </div>
                                <span className="font-medium whitespace-nowrap">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full transition-all duration-300"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: type.color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
