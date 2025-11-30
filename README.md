# Калибровка Метапрограмм НЛП / NLP Metaprograms Calibration

Production-ready NLP metaprograms calibration tool with support for overlapping marks, timer, and statistics. Built with Next.js 16, React 19, and shadcn/ui.

**🎯 Профессиональный инструмент для тренировки навыков калибровки метапрограмм НЛП**

## Features

### 29 NLP Metaprograms Included

**1. Классификация мира по (9 типов)**
- Люди, Ценности, Результаты, Процессы, Процедуры, Вещи, Действия, Время, Место

**2. Стили организации информации (8 типов)**
- Размер информационного блока: Крупный/Малый
- Способ мышления: Детализация/Аналогия/Обобщение
- Ведущая сенсорная репрезентативная система: Визуальная/Аудиальная/Кинестетическая

**3. Фокус сравнения (2 типа)**
- Сходство, Различие

**4. Мотивация (2 типа)**
- Приближение: к позитиву / Избегание: от негатива

**5. Референция (фокус силы) (3 типа)**
- Внутренняя, Внешняя (на других), Внешняя (на контекст/систему)

**6. Время (5 типов)**
- Ориентация: Прошлое/Настоящее/Будущее
- Продолжительность: Включенное время/Сквозное время

### Core Functionality
- **Advanced Text Annotation**: Highlight and annotate text with multiple overlapping marks
- **29 Pre-configured NLP Metaprograms**: Full hierarchy organized by 6 main categories
- **Custom Annotation Types**: Create, edit, and manage your own metaprograms
- **Overlapping Mark Support**: Handle complex, non-hierarchical annotations seamlessly
- **Selection Modes**: Character, Word, Sentence, and Paragraph-level selection

### Calibration Features
- ⏱ **Built-in Timer**: Track your analysis speed with start/stop/reset controls
- 📊 **Statistics Dashboard**: Real-time metrics including:
  - Analysis time (MM:SS format)
  - Total annotations count
  - Speed: annotations per minute
  - Character count
- 🎨 **Categorized UI**: Metaprograms organized by category for easy navigation
- 🇷🇺 **Russian Language Support**: Full Cyrillic text support with sample text included
- 🏃 **Speed Training**: Compare and improve your calibration speed over time

### User Experience
- **Real-time Visual Feedback**: Color-coded highlights for each metaprogram
- **Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Отменить (Undo)
  - `Ctrl+Y` / `Cmd+Y`: Повторить (Redo)
  - `Ctrl+S` / `Cmd+S`: Сохранить (Save)
  - `1-9`: Quick-select metaprograms from first category
- **Undo/Redo**: Full history tracking (up to 50 operations)
- **Persistent Storage**: Auto-saves to localStorage
- **File Upload**: Load `.txt` and `.md` files
- **Export Options**:
  - JSON format (with complete annotation metadata)
  - Plain text format (with annotation list)

### Technical Excellence
- **TypeScript**: Full type safety across the entire codebase
- **Production-Ready**: Error boundaries, loading states, and proper error handling
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: ARIA patterns and keyboard navigation
- **Performance**: Optimized rendering for large texts and many annotations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useReducer)
- **Storage**: Browser localStorage API

## Getting Started

### Prerequisites
- Node.js 20+ (for Next.js 16 compatibility)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## How to Use

### 1. Start Timer (Optional)
- Click **"Старт"** to begin tracking your calibration speed
- Timer will auto-clear annotations and start from 00:00
- Click **"Стоп"** to pause, **"Сброс"** to reset

### 2. Load or Input Text
- Use the pre-loaded Russian sample text about metaprogramming
- Or paste your own text
- Or upload a `.txt` or `.md` file

### 3. Select Metaprogram Type
- Right panel shows all 27 metaprograms organized by category
- Click on any metaprogram to select it
- Use keyboard shortcuts (1-9) for first category quick access
- Color-coded for easy visual identification

### 4. Annotate Text
- Select the text you want to annotate
- Choose selection mode (Character/Word/Sentence/Paragraph)
- Click **"Mark Selection"** button
- Selected text will be highlighted with the chosen metaprogram color
- Click on any mark to view details or remove it

### 5. Review & Analyze
- **Список аннотаций** panel shows all your annotations
- **Статистика** panel displays:
  - Время анализа (analysis time)
  - Всего аннотаций (total annotations)
  - Скорость (speed in annotations/minute)
  - Символов в тексте (character count)
- See statistics grouped by metaprogram type

### 6. Save & Export
- Click **"Save to Browser"** (or Ctrl+S) to persist your work
- Export as JSON for data analysis
- Export as plain text for review

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main NLP calibration page
│   └── globals.css         # Global styles & Tailwind config
├── components/
│   ├── annotation-types/
│   │   ├── nlp-type-selector.tsx # NLP metaprograms selector (categorized)
│   │   └── type-manager.tsx      # Type CRUD operations
│   ├── text-editor/
│   │   ├── text-input.tsx        # Text input with file upload
│   │   ├── text-editor.tsx       # Main editor component
│   │   ├── marked-text.tsx       # Rendered text with overlapping marks
│   │   ├── marks-list.tsx        # Annotation list panel
│   │   └── export-menu.tsx       # Export functionality
│   ├── ui/                       # shadcn/ui components (54 components)
│   └── error-boundary.tsx        # Error handling
├── hooks/
│   ├── use-text-selection.ts     # Text selection with mode snapping
│   ├── use-marking-state.ts      # State + undo/redo (50 levels)
│   └── use-keyboard-shortcuts.ts # Keyboard shortcuts handler
├── lib/
│   ├── utils.ts                  # Tailwind utility
│   ├── text-processing.ts        # Tokenization & boundary detection
│   ├── mark-operations.ts        # Mark CRUD + overlapping rendering
│   ├── storage.ts                # localStorage + export (JSON/text)
│   └── nlp-metaprograms.ts       # 27 NLP metaprograms + categories
└── types/
    └── annotation.ts             # TypeScript interfaces
```

## Customization

### Adding Custom Annotation Types

```typescript
const customType: AnnotationType = {
  id: "custom-id",
  name: "Custom Type",
  color: "#ff6b6b",
  description: "My custom annotation type",
  shortcut: "9",
};
```

### Modifying Selection Behavior

Edit `src/lib/text-processing.ts` to customize how text boundaries are detected:
- `findWordBoundaries()`: Word-level selection
- `findSentenceBoundaries()`: Sentence-level selection
- `findParagraphBoundaries()`: Paragraph-level selection

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

Requires modern JavaScript features:
- `crypto.randomUUID()`
- `localStorage` API
- ES6+ syntax

## Performance Notes

- **Optimal**: < 10,000 characters, < 100 annotations
- **Good**: 10,000-50,000 characters, < 500 annotations
- **Fair**: 50,000+ characters, 500+ annotations

For very large texts, consider chunking the input into smaller sections.

## Contributing

This is a production-ready template. Feel free to:
- Add new annotation types
- Implement additional export formats
- Add collaboration features
- Integrate with backend storage
- Add AI-powered annotation suggestions

## License

MIT - Feel free to use in your projects!

## Support

For issues or questions, please check:
- TypeScript errors: Ensure all types are properly imported
- Build errors: Run `npm install` and `npm run build`
- Runtime errors: Check browser console for details

Built with ❤️ using Next.js 16, React 19, and shadcn/ui
