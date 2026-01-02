# UE5 Knowledge Base Website

A modern, responsive React website that organizes and enhances the existing Unreal Engine 5 knowledge base with comprehensive architectural references, diagrams, and reusable code patterns.

## Features

- **📚 Topics**: Comprehensive guides organized by category (Architecture, Core Systems, Control, Design Patterns)
- **📊 Diagrams**: Interactive Mermaid diagrams with fullscreen viewing
- **🧱 Lego Pieces**: Reusable C++ code snippets and patterns
- **📦 Collections**: Full HTML-based comprehensive resources
- **🔍 Search**: Fuzzy search across all content with tag filtering
- **🏷️ Tag System**: Cross-referenced tagging for easy navigation
- **🌓 Dark/Light Mode**: Toggle between themes
- **📱 Responsive**: Mobile-first design with collapsible navigation

## Tech Stack

- **React 18** + **TypeScript**
- **Material UI** for components
- **React Router** for navigation
- **Mermaid.js** for diagram rendering
- **React Markdown** for content rendering
- **Fuse.js** for fuzzy search
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell, Header, Sidebar
│   ├── content/         # MarkdownRenderer, MermaidDiagram, CodeBlock, TagChip
│   └── features/        # ContentCard, RelatedContent
├── pages/               # All page components
├── data/
│   ├── content-index.ts # Master content index
│   └── tags.ts          # Tag definitions and colors
├── types/
│   └── content.ts       # TypeScript type definitions
├── theme/
│   ├── theme.ts         # MUI theme configuration
│   └── ThemeProvider.tsx # Theme context provider
└── App.tsx              # Main app with routing
```

## Content Management

### Adding New Content

All content files are stored in `public/content/`:

- **Markdown files** (`.md`): Topics and guides
- **Mermaid files** (`.mermaid`): Diagrams
- **HTML files** (`.html`): Collections

### Content Index

To add new content, update `src/data/content-index.ts`:

```typescript
{
  id: 'unique-id',
  slug: 'url-friendly-slug',
  title: 'Display Title',
  type: 'topic' | 'diagram' | 'lego-piece' | 'collection',
  category: 'architecture' | 'core-systems' | 'control' | 'design',
  tags: ['Tag1', 'Tag2'],
  summary: 'Brief description',
  sourcePath: 'filename.md',
  relatedItems: ['id1', 'id2'],
}
```

### Tag System

Tags are defined in `src/data/tags.ts`. Each tag has:
- Name
- Color (hex code)
- Auto-generated clickable chips

## Key Features

### Navigation
- Persistent sidebar on desktop
- Collapsible drawer on mobile
- Breadcrumbs on all content pages
- Quick search in header

### Content Rendering
- **Markdown**: Full GFM support with code highlighting
- **Mermaid**: Interactive diagrams with fullscreen mode
- **HTML**: Sanitized rendering of HTML collections
- **Code Blocks**: Syntax highlighting with copy button

### Search
- Fuzzy search across titles, summaries, and tags
- Tag-based filtering
- Real-time results

### Related Content
- Algorithm based on explicit relationships
- Tag-based similarity matching
- Displayed in sidebar on detail pages

## Theming

The app supports dark (default) and light themes:

```typescript
// Dark Theme
background: #0f172a (deep slate)
primary: #38bdf8 (sky blue)
secondary: #a78bfa (purple)

// Light Theme
background: #f8fafc (light slate)
primary: #0284c7 (blue)
secondary: #7c3aed (purple)
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder, ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### Environment Variables

No environment variables are required for basic functionality.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Hattin UE5 Knowledge Base.

## Contributing

To add new content:
1. Add the source file to `public/content/`
2. Update `src/data/content-index.ts`
3. Add any new tags to `src/data/tags.ts`
4. Test locally with `npm run dev`

## Roadmap

- [ ] Extract individual lego pieces from HTML collections
- [ ] Add table of contents for long topics
- [ ] Implement favorites/bookmarks
- [ ] Add print-friendly styling
- [ ] Export content as PDF
- [ ] Add code playground for C++ snippets
