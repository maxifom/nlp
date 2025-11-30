# GitHub Pages Deployment Guide

This project is configured for static deployment on GitHub Pages.

## Automated Deployment

The project is configured with GitHub Actions for automatic deployment:

1. **Push to main branch** - Automatically triggers deployment
2. **Manual deployment** - Use "Actions" tab → "Deploy to GitHub Pages" → "Run workflow"

## GitHub Pages Setup

1. Go to your repository **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source**: GitHub Actions
3. Save and wait for the first deployment

## Configuration

### Base Path
The app is configured to work with the repository name as base path:
- Local: `http://localhost:3000`
- Production: `https://[username].github.io/metaprogramms/`

To change the repository name or use custom domain:
1. Edit `next.config.ts` - update `basePath`
2. Push changes

### Static Export
The project uses Next.js static export (`output: 'export'`):
- ✅ No server required
- ✅ All pages pre-rendered
- ✅ Client-side only
- ✅ LocalStorage for persistence
- ✅ URL-based sharing

## Build Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output will be in ./out directory
```

## Deployment Checklist

✅ Next.js configured for static export
✅ All dependencies optimized
✅ No API routes (static only)
✅ Images unoptimized (no server required)
✅ GitHub Actions workflow configured
✅ .nojekyll file included

## Removed Dependencies

The following unused dependencies were removed to optimize bundle size:
- Form handling: react-hook-form, @hookform/resolvers, zod
- UI components: Various unused Radix UI components, carousels, charts
- Themes: next-themes (using fixed light theme)
- Date utilities: date-fns
- Other: vaul, input-otp, cmdk, recharts, embla-carousel, react-resizable-panels

## Current Dependencies

Core dependencies kept:
- **Next.js 16.0.5** - React framework with static export
- **React 19.2.0** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui components** - Button, Card, Badge, Select, Dialog, Dropdown, Textarea, ScrollArea
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **jsPDF & pdf-lib** - PDF export
- **lz-string** - URL compression for sharing

## Troubleshooting

**Build fails:**
- Check `npm run build` output for errors
- Ensure all dependencies are installed: `npm ci`

**404 on deployment:**
- Verify basePath in `next.config.ts` matches repository name
- Check GitHub Pages source is set to "GitHub Actions"

**Sharing links don't work:**
- Links use URL hash (#share=...) which works with static hosting
- Ensure .nojekyll file is present in out/ directory

## Local Development

```bash
npm run dev
```

Runs on `http://localhost:3000` (no base path in development)
