"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import type { AnnotationType } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TypeManagerProps {
  types: AnnotationType[];
  onAddType: (type: Omit<AnnotationType, "id">) => void;
  onUpdateType: (id: string, updates: Partial<AnnotationType>) => void;
  onDeleteType: (id: string) => void;
}

export function TypeManager({
  types,
  onAddType,
  onUpdateType,
  onDeleteType,
}: TypeManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    description: "",
    shortcut: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateType(editingId, formData);
    } else {
      onAddType(formData);
    }
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: "", color: "#3b82f6", description: "", shortcut: "" });
  };

  const handleEdit = (type: AnnotationType) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      color: type.color,
      description: type.description || "",
      shortcut: type.shortcut || "",
    });
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Manage Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Annotation Types</DialogTitle>
          <DialogDescription>
            Create and manage annotation types for your text analysis
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {types.map((type) => (
              <Card key={type.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      {type.description && (
                        <div className="text-sm text-muted-foreground">
                          {type.description}
                        </div>
                      )}
                    </div>
                    {type.shortcut && (
                      <Badge variant="secondary">{type.shortcut}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(type)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteType(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 border-t pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Concept, Definition"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shortcut">Keyboard Shortcut (optional)</Label>
              <Input
                id="shortcut"
                value={formData.shortcut}
                onChange={(e) =>
                  setFormData({ ...formData, shortcut: e.target.value })
                }
                placeholder="e.g., 1, 2, 3"
                maxLength={1}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{editingId ? "Update" : "Add"} Type</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
