"use client";

import { BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Mark, AnnotationType } from "@/types/annotation";
import { getCategoryStats } from "@/lib/mark-operations";
import { MAIN_CATEGORIES } from "@/lib/nlp-metaprograms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Статистика по группам
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {marks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No annotations yet. Start annotating to see group statistics.
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
                        <div className="flex items-center gap-2 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{stat.categoryName}</span>
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">
                          {stat.count} ({stat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden ml-6">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-6 mt-3 space-y-2 pt-2 border-t">
                        {metaprogramsWithCounts.map(({ type, count }) => {
                          const percentage = totalMarks > 0 ? (count / totalMarks) * 100 : 0;
                          return (
                            <div key={type.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: type.color }}
                                  />
                                  <span className="text-muted-foreground">{type.name}</span>
                                </div>
                                <span className="font-medium">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
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
