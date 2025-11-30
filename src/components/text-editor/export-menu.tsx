"use client";

import { Download, FileJson, FileText, FileType, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import type { Mark, AnnotationType } from "@/types/annotation";
import { exportToJSON, downloadFile, importFromJSON } from "@/lib/storage";
import { exportToPDF } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  text: string;
  marks: Mark[];
  annotationTypes: AnnotationType[];
  onImport: (data: { text: string; marks: Mark[] }) => void;
}

export function ExportMenu({
  text,
  marks,
  annotationTypes,
  onImport,
}: ExportMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleExportJSON = () => {
    const json = exportToJSON(text, marks, annotationTypes);
    const timestamp = new Date().toISOString().split("T")[0];
    downloadFile(
      json,
      `annotations-${timestamp}.json`,
      "application/json"
    );
  };

  const handleExportPlainText = () => {
    const typeMap = new Map(annotationTypes.map((t) => [t.id, t]));

    let output = text + "\n\n";
    output += "=".repeat(50) + "\n";
    output += "ANNOTATIONS\n";
    output += "=".repeat(50) + "\n\n";

    const sortedMarks = [...marks].sort((a, b) => a.startIndex - b.startIndex);

    sortedMarks.forEach((mark, idx) => {
      const type = typeMap.get(mark.typeId);
      output += `${idx + 1}. [${type?.name || "Unknown"}] (${mark.startIndex}-${mark.endIndex})\n`;
      output += `   "${mark.text}"\n\n`;
    });

    const timestamp = new Date().toISOString().split("T")[0];
    downloadFile(
      output,
      `annotations-${timestamp}.txt`,
      "text/plain"
    );
  };

  const handleExportPDF = async () => {
    const pdf = await exportToPDF(text, marks, annotationTypes);
    const timestamp = new Date().toISOString().split("T")[0];
    pdf.save(`annotations-${timestamp}.pdf`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importFromJSON(content);
        onImport({ text: imported.text, marks: imported.marks });
        toast.success(`Import successful: Loaded ${imported.marks.length} annotations`);
      } catch (error) {
        toast.error(`Import failed: ${error instanceof Error ? error.message : "Invalid JSON file"}`);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be loaded again
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileType className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPlainText}>
            <FileText className="mr-2 h-4 w-4" />
            Export as Plain Text
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import from JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
