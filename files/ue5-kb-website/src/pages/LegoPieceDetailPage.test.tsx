import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import { LegoPieceDetailPage } from './LegoPieceDetailPage';
import { useParams } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><text>Test Diagram</text></svg>',
    }),
  },
}));

// Mock the content data
vi.mock('../data/content-index', () => ({
  legoPieces: [
    {
      id: 'lego-01',
      slug: 'test-lego-piece',
      title: 'Test Lego Piece Title',
      type: 'lego-piece',
      pieceType: 'Component',
      tags: ['Test', 'Component', 'Architecture'],
      summary: 'This is a test summary for the lego piece',
      codeSnippet: `// Test code snippet
class MyComponent {
  void TestMethod() {}
};`,
      explanation: 'This is the detailed explanation for the test lego piece',
      diagram: `flowchart TD
    A[Start] --> B[End]`,
      relatedTopics: ['topic-01'],
    },
    {
      id: 'lego-02',
      slug: 'test-lego-piece-no-diagram',
      title: 'Test Piece Without Diagram',
      type: 'lego-piece',
      pieceType: 'Utility',
      tags: ['Test', 'Utility'],
      summary: 'A lego piece without a diagram',
      codeSnippet: 'void TestFunction() {}',
      explanation: 'Explanation without diagram',
      relatedTopics: [],
    },
  ],
  getRelatedContent: vi.fn().mockReturnValue([
    {
      id: 'topic-01',
      slug: 'related-topic',
      title: 'Related Topic',
      type: 'topic',
      tags: ['Test'],
      summary: 'Related topic summary',
    },
  ]),
}));

describe('LegoPieceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders all content fields correctly', () => {
    it('should render the title field', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Title appears in both breadcrumb and header, use heading role
      expect(screen.getByRole('heading', { name: 'Test Lego Piece Title' })).toBeInTheDocument();
    });

    it('should render the summary field', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      expect(screen.getByText('This is a test summary for the lego piece')).toBeInTheDocument();
    });

    it('should render the code snippet field', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check for code content
      expect(screen.getByText(/Test code snippet/i)).toBeInTheDocument();
      expect(screen.getByText(/class MyComponent/i)).toBeInTheDocument();
    });

    it('should render the diagram field when present', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check for diagram section heading
      expect(screen.getByText('Flow Diagram')).toBeInTheDocument();
    });

    it('should render the explanation field', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check for explanation section heading
      expect(screen.getByText('Explanation')).toBeInTheDocument();
      expect(screen.getByText('This is the detailed explanation for the test lego piece')).toBeInTheDocument();
    });

    it('should render all content fields together', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Verify all major sections are present
      expect(screen.getByText('Test Lego Piece Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test summary for the lego piece')).toBeInTheDocument();
      expect(screen.getByText('Flow Diagram')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });

    it('should not render diagram section when diagram is not present', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece-no-diagram' });

      render(<LegoPieceDetailPage />);

      // Diagram section should not be present
      expect(screen.queryByText('Flow Diagram')).not.toBeInTheDocument();
      // But other sections should still be present
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });

    it('should render pieceType chip', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check for pieceType chip (may appear in tags too, so use getAllByText)
      const componentChips = screen.getAllByText('Component');
      expect(componentChips.length).toBeGreaterThanOrEqual(1);
    });

    it('should render lego-piece type chip', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check for type chip
      expect(screen.getByText('lego-piece')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Tags should be rendered (use getAllByText for potentially duplicate text)
      expect(screen.getAllByText('Test')).not.toHaveLength(0);
      expect(screen.getAllByText('Component')).not.toHaveLength(0);
      expect(screen.getAllByText('Architecture')).not.toHaveLength(0);
    });

    it('should render breadcrumbs', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Check breadcrumb navigation
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Lego Pieces')).toBeInTheDocument();
    });

    it('should display not found message for invalid slug', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'non-existent-piece' });

      render(<LegoPieceDetailPage />);

      expect(screen.getByText('Lego piece not found')).toBeInTheDocument();
    });
  });

  describe('section headings', () => {
    it('should render Code section heading', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      const codeHeading = screen.getByText('Code');
      expect(codeHeading).toBeInTheDocument();
      expect(codeHeading.tagName).toBe('H2');
    });

    it('should render Explanation section heading', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      const explanationHeading = screen.getByText('Explanation');
      expect(explanationHeading).toBeInTheDocument();
      expect(explanationHeading.tagName).toBe('H2');
    });

    it('should render Flow Diagram section heading when diagram exists', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      const diagramHeading = screen.getByText('Flow Diagram');
      expect(diagramHeading).toBeInTheDocument();
      expect(diagramHeading.tagName).toBe('H2');
    });
  });

  describe('related content', () => {
    it('should render related content when available', () => {
      vi.mocked(useParams).mockReturnValue({ slug: 'test-lego-piece' });

      render(<LegoPieceDetailPage />);

      // Related content should be rendered (from mock)
      expect(screen.getByText('Related Topic')).toBeInTheDocument();
    });
  });
});
