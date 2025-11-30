"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function TextInput({ text, onTextChange }: TextInputProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Введите или вставьте текст здесь..."
          className="min-h-[150px] max-h-[400px] font-mono text-sm resize-y"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {text.length} символов
        </p>
      </CardContent>
    </Card>
  );
}
