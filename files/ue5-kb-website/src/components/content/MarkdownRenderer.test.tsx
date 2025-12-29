import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg data-testid="mermaid-svg"><text>Mermaid Diagram</text></svg>',
    }),
  },
}));

// Mock MermaidDiagram component
vi.mock('./MermaidDiagram', () => ({
  MermaidDiagram: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-diagram" data-chart={chart}>
      Mermaid Diagram Component
    </div>
  ),
}));

// Mock CodeBlock component
vi.mock('./CodeBlock', () => ({
  CodeBlock: ({ code, language, inline }: { code: string; language?: string; inline?: boolean }) => (
    <div data-testid="code-block" data-language={language} data-inline={inline}>
      {code}
    </div>
  ),
}));

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('identifies and renders mermaid code blocks', () => {
    it('should identify mermaid code blocks correctly', () => {
      const content = `
# Test Document

\`\`\`mermaid
flowchart TD
  A[Start] --> B[End]
\`\`\`

Regular text after diagram.
`;

      render(<MarkdownRenderer content={content} />);

      // MermaidDiagram component should be rendered
      expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
    });

    it('should render mermaid flowchart correctly', () => {
      const mermaidChart = `flowchart TD
  A[Start] --> B[Process]
  B --> C[End]`;

      const content = `\`\`\`mermaid
${mermaidChart}
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram).toBeInTheDocument();
      expect(diagram.getAttribute('data-chart')).toBe(mermaidChart);
    });

    it('should render mermaid sequence diagram correctly', () => {
      const mermaidChart = `sequenceDiagram
  Alice->>John: Hello John
  John-->>Alice: Hello Alice`;

      const content = `\`\`\`mermaid
${mermaidChart}
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram).toBeInTheDocument();
      expect(diagram.getAttribute('data-chart')).toBe(mermaidChart);
    });

    it('should render mermaid class diagram correctly', () => {
      const mermaidChart = `classDiagram
  Class01 <|-- Class02
  Class03 *-- Class04`;

      const content = `\`\`\`mermaid
${mermaidChart}
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram).toBeInTheDocument();
      expect(diagram.getAttribute('data-chart')).toBe(mermaidChart);
    });

    it('should use MermaidDiagram component for mermaid code blocks', () => {
      const content = `\`\`\`mermaid
graph LR
  A --> B
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      // Should render MermaidDiagram component
      expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
      expect(screen.getByText('Mermaid Diagram Component')).toBeInTheDocument();
    });

    it('should not render mermaid for non-mermaid code blocks', () => {
      const content = `\`\`\`javascript
const x = 10;
console.log(x);
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      // Should render CodeBlock, not MermaidDiagram
      expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });

    it('should render multiple mermaid diagrams in same document', () => {
      const content = `
# Multiple Diagrams

\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

Some text in between.

\`\`\`mermaid
graph LR
  C --> D
\`\`\`
`;

      render(<MarkdownRenderer content={content} />);

      const diagrams = screen.getAllByTestId('mermaid-diagram');
      expect(diagrams).toHaveLength(2);
    });

    it('should handle mixed content with mermaid and regular code blocks', () => {
      const content = `
# Mixed Content

\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

\`\`\`cpp
void MyFunction() {}
\`\`\`

\`\`\`mermaid
graph LR
  C --> D
\`\`\`
`;

      render(<MarkdownRenderer content={content} />);

      // Should have 2 mermaid diagrams
      expect(screen.getAllByTestId('mermaid-diagram')).toHaveLength(2);
      
      // Should have 1 regular code block
      const codeBlocks = screen.getAllByTestId('code-block');
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].getAttribute('data-language')).toBe('cpp');
    });
  });

  describe('renders other markdown elements correctly', () => {
    it('should render headings', () => {
      const content = `
# Heading 1
## Heading 2
### Heading 3
`;

      render(<MarkdownRenderer content={content} />);

      expect(screen.getByText('Heading 1')).toBeInTheDocument();
      expect(screen.getByText('Heading 2')).toBeInTheDocument();
      expect(screen.getByText('Heading 3')).toBeInTheDocument();
    });

    it('should render paragraphs', () => {
      const content = 'This is a paragraph of text.';

      render(<MarkdownRenderer content={content} />);

      expect(screen.getByText('This is a paragraph of text.')).toBeInTheDocument();
    });

    it('should render links', () => {
      const content = '[Click here](https://example.com)';

      render(<MarkdownRenderer content={content} />);

      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render inline code using CodeBlock', () => {
      const content = 'This has `inline code` in it.';

      render(<MarkdownRenderer content={content} />);

      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock.getAttribute('data-inline')).toBe('true');
      expect(codeBlock.textContent).toBe('inline code');
    });

    it('should render regular code blocks using CodeBlock', () => {
      const content = `\`\`\`cpp
void MyFunction() {
  return;
}
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock.getAttribute('data-language')).toBe('cpp');
    });

    it('should render lists', () => {
      const content = `
- Item 1
- Item 2
- Item 3
`;

      render(<MarkdownRenderer content={content} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render blockquotes', () => {
      const content = '> This is a blockquote';

      render(<MarkdownRenderer content={content} />);

      expect(screen.getByText('This is a blockquote')).toBeInTheDocument();
    });
  });

  describe('mermaid code block edge cases', () => {
    it('should handle empty mermaid code block', () => {
      const content = `\`\`\`mermaid
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram).toBeInTheDocument();
      // Empty chart string after trimming trailing newline
      const chartAttr = diagram.getAttribute('data-chart');
      expect(chartAttr === '' || chartAttr === null).toBe(true);
    });

    it('should handle mermaid code block with whitespace', () => {
      const mermaidChart = `
flowchart TD
  A --> B
`;

      const content = `\`\`\`mermaid${mermaidChart}\`\`\``;

      render(<MarkdownRenderer content={content} />);

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram).toBeInTheDocument();
    });

    it('should not confuse mermaid with similarly named language', () => {
      const content = `\`\`\`mermaidjs
graph TD
  A --> B
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      // Should render as regular code block, not mermaid
      expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });

    it('should be case-sensitive for mermaid language identifier', () => {
      const content = `\`\`\`Mermaid
graph TD
  A --> B
\`\`\``;

      render(<MarkdownRenderer content={content} />);

      // Should render as regular code block due to case mismatch
      expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });
  });

  describe('complete document rendering', () => {
    it('should render a complete document with mermaid diagrams', () => {
      const content = `
# Architecture Overview

This document describes the system architecture.

## Component Diagram

\`\`\`mermaid
flowchart TD
  A[Component A] --> B[Component B]
  B --> C[Component C]
\`\`\`

## Description

The system consists of three main components working together.

### Code Example

\`\`\`cpp
void Initialize() {
  // Setup code
}
\`\`\`

## Sequence Flow

\`\`\`mermaid
sequenceDiagram
  User->>System: Request
  System-->>User: Response
\`\`\`
`;

      render(<MarkdownRenderer content={content} />);

      // Check headings
      expect(screen.getByText('Architecture Overview')).toBeInTheDocument();
      expect(screen.getByText('Component Diagram')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();

      // Check mermaid diagrams
      expect(screen.getAllByTestId('mermaid-diagram')).toHaveLength(2);

      // Check code block
      expect(screen.getByTestId('code-block')).toBeInTheDocument();

      // Check paragraph text
      expect(screen.getByText(/This document describes/)).toBeInTheDocument();
    });
  });
});
