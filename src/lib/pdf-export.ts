import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Mark, AnnotationType } from "@/types/annotation";

export async function exportToPDF(
  text: string,
  marks: Mark[],
  annotationTypes: AnnotationType[]
): Promise<{ save: (filename: string) => void }> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Register fontkit for custom font support
  pdfDoc.registerFontkit(fontkit);

  // Load font with Cyrillic support
  const fontResponse = await fetch('/Roboto-Regular.ttf');
  const fontBytes = await fontResponse.arrayBuffer();
  const customFont = await pdfDoc.embedFont(fontBytes);

  // Create first page
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;

  const typeMap = new Map(annotationTypes.map((t) => [t.id, t]));

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin) {
      page = pdfDoc.addPage();
      yPosition = height - margin;
    }
  };

  // Title
  page.drawText("Калибровка Метапрограмм НЛП", {
    x: margin,
    y: yPosition,
    size: 20,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Date and summary
  const dateStr = `Дата экспорта: ${new Date().toLocaleString('ru-RU')}`;
  page.drawText(dateStr, {
    x: margin,
    y: yPosition,
    size: 10,
    font: customFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 15;

  page.drawText(`Всего аннотаций: ${marks.length}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: customFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 15;

  page.drawText(`Длина текста: ${text.length} символов`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: customFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 30;

  // Sort marks by position
  const sortedMarks = [...marks].sort((a, b) => a.startIndex - b.startIndex);

  // Table header
  checkNewPage(100);
  page.drawText("№", { x: margin, y: yPosition, size: 11, font: customFont, color: rgb(0, 0, 0) });
  page.drawText("Тип", { x: margin + 40, y: yPosition, size: 11, font: customFont, color: rgb(0, 0, 0) });
  page.drawText("Текст", { x: margin + 150, y: yPosition, size: 11, font: customFont, color: rgb(0, 0, 0) });
  page.drawText("Позиция", { x: margin + 400, y: yPosition, size: 11, font: customFont, color: rgb(0, 0, 0) });
  yPosition -= 20;

  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y: yPosition + 5 },
    end: { x: width - margin, y: yPosition + 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  yPosition -= 10;

  // Table rows
  sortedMarks.forEach((mark, idx) => {
    checkNewPage(25);

    const type = typeMap.get(mark.typeId);
    const rowNum = `${idx + 1}`;
    const typeName = type?.name || "Неизвестно";
    const markText = mark.text.length > 50 ? mark.text.substring(0, 47) + "..." : mark.text;
    const position = `${mark.startIndex}-${mark.endIndex}`;

    // Draw color indicator
    if (type) {
      const color = hexToRgb(type.color);
      page.drawCircle({
        x: margin + 25,
        y: yPosition - 3,
        size: 4,
        color: rgb(color.r / 255, color.g / 255, color.b / 255),
      });
    }

    page.drawText(rowNum, { x: margin, y: yPosition, size: 9, font: customFont });
    page.drawText(typeName, { x: margin + 40, y: yPosition, size: 9, font: customFont });
    page.drawText(markText, { x: margin + 150, y: yPosition, size: 9, font: customFont });
    page.drawText(position, { x: margin + 400, y: yPosition, size: 9, font: customFont });

    yPosition -= 15;
  });

  yPosition -= 20;

  // Statistics section
  checkNewPage(100);

  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  yPosition -= 20;

  page.drawText("Статистика по типам", {
    x: margin,
    y: yPosition,
    size: 14,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Group by type for statistics
  const typeStats = new Map<string, number>();
  sortedMarks.forEach((mark) => {
    const count = typeStats.get(mark.typeId) || 0;
    typeStats.set(mark.typeId, count + 1);
  });

  const sortedTypes = Array.from(typeStats.entries()).sort((a, b) => b[1] - a[1]);

  // Statistics table header
  page.drawText("Метапрограмма", { x: margin, y: yPosition, size: 11, font: customFont });
  page.drawText("Количество", { x: margin + 250, y: yPosition, size: 11, font: customFont });
  page.drawText("Процент", { x: margin + 350, y: yPosition, size: 11, font: customFont });
  yPosition -= 20;

  page.drawLine({
    start: { x: margin, y: yPosition + 5 },
    end: { x: width - margin, y: yPosition + 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  yPosition -= 10;

  // Statistics table rows
  sortedTypes.forEach(([typeId, count]) => {
    checkNewPage(25);

    const type = typeMap.get(typeId);
    const typeName = type?.name || "Неизвестно";
    const percentage = `${((count / marks.length) * 100).toFixed(1)}%`;

    // Draw color indicator
    if (type) {
      const color = hexToRgb(type.color);
      page.drawCircle({
        x: margin + 240,
        y: yPosition - 3,
        size: 4,
        color: rgb(color.r / 255, color.g / 255, color.b / 255),
      });
    }

    page.drawText(typeName, { x: margin, y: yPosition, size: 9, font: customFont });
    page.drawText(count.toString(), { x: margin + 250, y: yPosition, size: 9, font: customFont });
    page.drawText(percentage, { x: margin + 350, y: yPosition, size: 9, font: customFont });

    yPosition -= 15;
  });

  // Footer on all pages
  const pages = pdfDoc.getPages();
  pages.forEach((p, i) => {
    p.drawText(
      `Страница ${i + 1} из ${pages.length}`,
      {
        x: width / 2 - 40,
        y: 30,
        size: 8,
        font: customFont,
        color: rgb(0.6, 0.6, 0.6),
      }
    );
    p.drawText(
      "Создано с помощью Claude Code",
      {
        x: width - margin - 150,
        y: 30,
        size: 8,
        font: customFont,
        color: rgb(0.6, 0.6, 0.6),
      }
    );
  });

  // Return an object with save method compatible with jsPDF API
  const pdfBytes = await pdfDoc.save();

  return {
    save: (filename: string) => {
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
