import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegoPiecesPage } from './LegoPiecesPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock the content data
vi.mock('../data/content-index', () => ({
  legoPieces: [
    {
      id: 'lego-01',
      slug: 'test-component-1',
      title: 'Test Component 1',
      type: 'lego-piece',
      pieceType: 'Component',
      tags: ['Component', 'Test'],
      summary: 'This is a test component piece',
      codeSnippet: 'void Test1() {}',
      explanation: 'Explanation for test 1',
      relatedTopics: [],
    },
    {
      id: 'lego-02',
      slug: 'test-component-2',
      title: 'Test Component 2',
      type: 'lego-piece',
      pieceType: 'Component',
      tags: ['Component', 'Test'],
      summary: 'This is another test component piece',
      codeSnippet: 'void Test2() {}',
      explanation: 'Explanation for test 2',
      relatedTopics: [],
    },
    {
      id: 'lego-03',
      slug: 'test-utility-1',
      title: 'Test Utility 1',
      type: 'lego-piece',
      pieceType: 'Utility',
      tags: ['Utility', 'Test'],
      summary: 'This is a test utility piece',
      codeSnippet: 'void Utility() {}',
      explanation: 'Explanation for utility',
      relatedTopics: [],
    },
    {
      id: 'lego-04',
      slug: 'test-pattern-1',
      title: 'Test Pattern 1',
      type: 'lego-piece',
      pieceType: 'Pattern',
      tags: ['Pattern', 'Test'],
      summary: 'This is a test pattern piece',
      codeSnippet: 'void Pattern() {}',
      explanation: 'Explanation for pattern',
      relatedTopics: [],
    },
    {
      id: 'lego-05',
      slug: 'test-macro-1',
      title: 'Test Macro 1',
      type: 'lego-piece',
      pieceType: 'Macros',
      tags: ['Macros', 'Test'],
      summary: 'This is a test macro piece',
      codeSnippet: '#define TEST',
      explanation: 'Explanation for macro',
      relatedTopics: [],
    },
  ],
}));

// Mock ContentCard component
vi.mock('../components/features/ContentCard', () => ({
  ContentCard: ({ content }: { content: any }) => (
    <div data-testid="content-card" data-content-id={content.id}>
      <h3>{content.title}</h3>
      <p>{content.summary}</p>
      <span data-testid="piece-type">{content.pieceType}</span>
    </div>
  ),
}));

describe('LegoPiecesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('should render page title', () => {
      render(<LegoPiecesPage />);

      expect(screen.getByText('Lego Pieces')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<LegoPiecesPage />);

      expect(screen.getByText(/Reusable C\+\+ code snippets and patterns/i)).toBeInTheDocument();
    });

    it('should display all lego pieces by default', () => {
      render(<LegoPiecesPage />);

      // All 5 pieces should be displayed
      expect(screen.getAllByTestId('content-card')).toHaveLength(5);
    });

    it('should display piece type tabs', () => {
      render(<LegoPiecesPage />);

      // Should show All tab and all unique piece types
      expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Component' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Utility' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Pattern' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Macros' })).toBeInTheDocument();
    });

    it('should have "All" tab selected by default', () => {
      render(<LegoPiecesPage />);

      const allTab = screen.getByRole('tab', { name: 'All' });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('filtering by piece type', () => {
    it('should filter to show only Component pieces when Component tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Click Component tab
      const componentTab = screen.getByRole('tab', { name: 'Component' });
      await user.click(componentTab);

      // Should only show Component pieces
      await waitFor(() => {
        const cards = screen.getAllByTestId('content-card');
        expect(cards).toHaveLength(2);
        
        // Verify they are Component type
        const pieceTypes = screen.getAllByTestId('piece-type');
        pieceTypes.forEach((type) => {
          expect(type.textContent).toBe('Component');
        });
      });
    });

    it('should filter to show only Utility pieces when Utility tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Click Utility tab
      const utilityTab = screen.getByRole('tab', { name: 'Utility' });
      await user.click(utilityTab);

      // Should only show Utility pieces
      await waitFor(() => {
        const cards = screen.getAllByTestId('content-card');
        expect(cards).toHaveLength(1);
        
        expect(screen.getByText('Test Utility 1')).toBeInTheDocument();
      });
    });

    it('should filter to show only Pattern pieces when Pattern tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Click Pattern tab
      const patternTab = screen.getByRole('tab', { name: 'Pattern' });
      await user.click(patternTab);

      // Should only show Pattern pieces
      await waitFor(() => {
        const cards = screen.getAllByTestId('content-card');
        expect(cards).toHaveLength(1);
        
        expect(screen.getByText('Test Pattern 1')).toBeInTheDocument();
      });
    });

    it('should filter to show only Macros pieces when Macros tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Click Macros tab
      const macrosTab = screen.getByRole('tab', { name: 'Macros' });
      await user.click(macrosTab);

      // Should only show Macros pieces
      await waitFor(() => {
        const cards = screen.getAllByTestId('content-card');
        expect(cards).toHaveLength(1);
        
        expect(screen.getByText('Test Macro 1')).toBeInTheDocument();
      });
    });

    it('should return to showing all pieces when All tab is clicked after filtering', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // First filter to Component
      const componentTab = screen.getByRole('tab', { name: 'Component' });
      await user.click(componentTab);

      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(2);
      });

      // Then click All to show all pieces again
      const allTab = screen.getByRole('tab', { name: 'All' });
      await user.click(allTab);

      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(5);
      });
    });

    it('should update the selected tab when a different tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      const componentTab = screen.getByRole('tab', { name: 'Component' });
      await user.click(componentTab);

      await waitFor(() => {
        expect(componentTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('displays LegoPiece content cards correctly', () => {
    it('should display correct titles for all pieces', () => {
      render(<LegoPiecesPage />);

      expect(screen.getByText('Test Component 1')).toBeInTheDocument();
      expect(screen.getByText('Test Component 2')).toBeInTheDocument();
      expect(screen.getByText('Test Utility 1')).toBeInTheDocument();
      expect(screen.getByText('Test Pattern 1')).toBeInTheDocument();
      expect(screen.getByText('Test Macro 1')).toBeInTheDocument();
    });

    it('should display correct summaries for all pieces', () => {
      render(<LegoPiecesPage />);

      expect(screen.getByText('This is a test component piece')).toBeInTheDocument();
      expect(screen.getByText('This is another test component piece')).toBeInTheDocument();
      expect(screen.getByText('This is a test utility piece')).toBeInTheDocument();
      expect(screen.getByText('This is a test pattern piece')).toBeInTheDocument();
      expect(screen.getByText('This is a test macro piece')).toBeInTheDocument();
    });

    it('should render each piece as a ContentCard component', () => {
      render(<LegoPiecesPage />);

      const contentCards = screen.getAllByTestId('content-card');
      
      // Should have 5 content cards
      expect(contentCards).toHaveLength(5);
      
      // Verify each card has the correct content ID
      expect(contentCards[0]).toHaveAttribute('data-content-id', 'lego-01');
      expect(contentCards[1]).toHaveAttribute('data-content-id', 'lego-02');
      expect(contentCards[2]).toHaveAttribute('data-content-id', 'lego-03');
      expect(contentCards[3]).toHaveAttribute('data-content-id', 'lego-04');
      expect(contentCards[4]).toHaveAttribute('data-content-id', 'lego-05');
    });

    it('should display correct filtered cards when piece type is selected', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Filter to Component type
      const componentTab = screen.getByRole('tab', { name: 'Component' });
      await user.click(componentTab);

      await waitFor(() => {
        const cards = screen.getAllByTestId('content-card');
        expect(cards).toHaveLength(2);
        
        // Only Component pieces should be shown
        expect(screen.getByText('Test Component 1')).toBeInTheDocument();
        expect(screen.getByText('Test Component 2')).toBeInTheDocument();
        
        // Other types should not be shown
        expect(screen.queryByText('Test Utility 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Pattern 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Macro 1')).not.toBeInTheDocument();
      });
    });

    it('should display piece types correctly on cards', () => {
      render(<LegoPiecesPage />);

      const pieceTypes = screen.getAllByTestId('piece-type');
      
      expect(pieceTypes[0].textContent).toBe('Component');
      expect(pieceTypes[1].textContent).toBe('Component');
      expect(pieceTypes[2].textContent).toBe('Utility');
      expect(pieceTypes[3].textContent).toBe('Pattern');
      expect(pieceTypes[4].textContent).toBe('Macros');
    });
  });

  describe('empty state handling', () => {
    it('should not display empty message when pieces are present in selected category', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      const componentTab = screen.getByRole('tab', { name: 'Component' });
      await user.click(componentTab);

      await waitFor(() => {
        // Should show cards, not empty message
        expect(screen.getAllByTestId('content-card')).toHaveLength(2);
        expect(screen.queryByText(/No pieces found/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('tab navigation', () => {
    it('should allow switching between multiple tabs', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Start with All (5 pieces)
      expect(screen.getAllByTestId('content-card')).toHaveLength(5);

      // Switch to Component (2 pieces)
      await user.click(screen.getByRole('tab', { name: 'Component' }));
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(2);
      });

      // Switch to Utility (1 piece)
      await user.click(screen.getByRole('tab', { name: 'Utility' }));
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(1);
      });

      // Switch to Pattern (1 piece)
      await user.click(screen.getByRole('tab', { name: 'Pattern' }));
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(1);
      });

      // Switch back to All (5 pieces)
      await user.click(screen.getByRole('tab', { name: 'All' }));
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(5);
      });
    });

    it('should maintain filter state after multiple selections', async () => {
      const user = userEvent.setup();
      render(<LegoPiecesPage />);

      // Click Component tab
      await user.click(screen.getByRole('tab', { name: 'Component' }));
      
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(2);
      });

      // Click another piece type and verify it updates
      await user.click(screen.getByRole('tab', { name: 'Utility' }));
      
      await waitFor(() => {
        expect(screen.getAllByTestId('content-card')).toHaveLength(1);
        expect(screen.getByText('Test Utility 1')).toBeInTheDocument();
      });
    });
  });

  describe('grid layout', () => {
    it('should render pieces in a grid container', () => {
      const { container } = render(<LegoPiecesPage />);

      // Check for Grid container
      const gridContainer = container.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render each piece in a grid item', () => {
      const { container } = render(<LegoPiecesPage />);

      // Check for Grid items
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Should have grid items for all pieces
      expect(gridItems.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('navigation button', () => {
    it('should render Full Library button', () => {
      render(<LegoPiecesPage />);

      expect(screen.getByRole('button', { name: /Full Library/i })).toBeInTheDocument();
    });
  });
});
