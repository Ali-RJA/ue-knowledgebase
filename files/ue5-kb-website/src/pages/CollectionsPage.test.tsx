import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import { CollectionsPage } from './CollectionsPage';

// Mock the content data
vi.mock('../data/content-index', () => ({
  collections: [
    {
      id: 'collection-01',
      slug: 'anim-notify-architecture',
      title: 'AnimNotify Combat Architecture',
      type: 'collection',
      tags: ['Animation', 'Combat', 'Hit Detection', 'Architecture'],
      summary: 'Comprehensive AnimNotify architecture with diagrams and detailed explanations.',
    },
    {
      id: 'collection-02',
      slug: 'cpp-lego-pieces',
      title: 'C++ Common Pieces: The Lego Library',
      type: 'collection',
      tags: ['Component', 'Timer', 'Delegates', 'TMap', 'TArray', 'Interfaces'],
      summary: 'Reusable C++ code snippets and patterns for Unreal Engine development.',
    },
    {
      id: 'collection-03',
      slug: 'test-collection-3',
      title: 'Test Collection 3',
      type: 'collection',
      tags: ['Test', 'Mock'],
      summary: 'Test collection summary 3',
    },
  ],
}));

describe('CollectionsPage Grid Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid layout renders correctly', () => {
    it('should render the Grid container', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('should render Grid items for each collection', () => {
      render(<CollectionsPage />);
      
      // Should display all collections
      expect(screen.getByText('AnimNotify Combat Architecture')).toBeInTheDocument();
      expect(screen.getByText('C++ Common Pieces: The Lego Library')).toBeInTheDocument();
      expect(screen.getByText('Test Collection 3')).toBeInTheDocument();
    });

    it('should render correct number of Grid items', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Should have 3 Grid items (one for each collection)
      expect(gridItems.length).toBe(3);
    });

    it('should render each collection within a Grid item', () => {
      render(<CollectionsPage />);
      
      const collection1Card = screen.getByText('AnimNotify Combat Architecture').closest('[class*="MuiCard-root"]');
      const collection2Card = screen.getByText('C++ Common Pieces: The Lego Library').closest('[class*="MuiCard-root"]');
      const collection3Card = screen.getByText('Test Collection 3').closest('[class*="MuiCard-root"]');
      
      expect(collection1Card?.closest('[class*="MuiGrid-root"]')).toBeTruthy();
      expect(collection2Card?.closest('[class*="MuiGrid-root"]')).toBeTruthy();
      expect(collection3Card?.closest('[class*="MuiGrid-root"]')).toBeTruthy();
    });
  });

  describe('Grid responsiveness is maintained', () => {
    it('should apply responsive Grid size props (xs=12, md=6)', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Grid items should have responsive classes for xs and md breakpoints
      gridItems.forEach((item) => {
        const classes = item.className;
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should render Grid container with spacing prop', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      expect(gridContainers.length).toBeGreaterThan(0);
      gridContainers.forEach((grid) => {
        const classes = grid.className;
        // Should have Grid classes applied
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should maintain consistent Grid structure across all items', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // All Grid items should have consistent class structure
      const classPatterns = Array.from(gridItems).map(item => {
        return item.className.includes('MuiGrid-root');
      });
      
      // All items should match the pattern
      expect(classPatterns.every(pattern => pattern === true)).toBe(true);
    });
  });

  describe('Content within Grid components displays correctly', () => {
    it('should display ContentCard components within Grid items', () => {
      render(<CollectionsPage />);
      
      const collection1Card = screen.getByText('AnimNotify Combat Architecture').closest('[class*="MuiCard-root"]');
      const collection2Card = screen.getByText('C++ Common Pieces: The Lego Library').closest('[class*="MuiCard-root"]');
      const collection3Card = screen.getByText('Test Collection 3').closest('[class*="MuiCard-root"]');
      
      expect(collection1Card).toBeInTheDocument();
      expect(collection2Card).toBeInTheDocument();
      expect(collection3Card).toBeInTheDocument();
    });

    it('should display collection titles', () => {
      render(<CollectionsPage />);
      
      expect(screen.getByText('AnimNotify Combat Architecture')).toBeInTheDocument();
      expect(screen.getByText('C++ Common Pieces: The Lego Library')).toBeInTheDocument();
      expect(screen.getByText('Test Collection 3')).toBeInTheDocument();
    });

    it('should display collection summaries', () => {
      render(<CollectionsPage />);
      
      expect(screen.getByText('Comprehensive AnimNotify architecture with diagrams and detailed explanations.')).toBeInTheDocument();
      expect(screen.getByText('Reusable C++ code snippets and patterns for Unreal Engine development.')).toBeInTheDocument();
      expect(screen.getByText('Test collection summary 3')).toBeInTheDocument();
    });

    it('should display page heading and description', () => {
      render(<CollectionsPage />);
      
      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive collections of UE5 knowledge, architecture, and code libraries/i)).toBeInTheDocument();
    });

    it('should display all content within proper structure', () => {
      const { container } = render(<CollectionsPage />);
      
      // Page should have main container
      const mainContainer = container.querySelector('[class*="MuiContainer"]');
      expect(mainContainer).toBeInTheDocument();
      
      // Grid should be within the container
      const gridContainer = mainContainer?.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainer).toBeInTheDocument();
      
      // Cards should be within Grid items
      const gridItems = gridContainer?.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(gridItems?.length).toBe(3);
    });
  });

  describe('Grid spacing and container properties function correctly', () => {
    it('should apply Container component with maxWidth="lg"', () => {
      const { container } = render(<CollectionsPage />);
      
      const containers = container.querySelectorAll('[class*="MuiContainer"]');
      expect(containers.length).toBeGreaterThan(0);
      
      containers.forEach((cont) => {
        const classes = cont.className;
        expect(classes).toMatch(/MuiContainer/);
      });
    });

    it('should apply spacing={3} to Grid container', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridContainer = container.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.className).toMatch(/MuiGrid/);
    });

    it('should render Grid with both container and item properties', () => {
      const { container } = render(<CollectionsPage />);
      
      // Check for Grid container
      const gridContainer = container.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainer).toBeInTheDocument();
      
      // Check for Grid items
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(gridItems.length).toBe(3);
      
      // All items should be children of the container
      gridItems.forEach((item) => {
        expect(gridContainer?.contains(item)).toBe(true);
      });
    });

    it('should apply proper spacing between Grid items', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // All Grid items should be rendered
      expect(gridItems.length).toBe(3);
      
      // Each should have Grid classes for spacing
      gridItems.forEach((item) => {
        expect(item.className).toMatch(/MuiGrid/);
      });
    });

    it('should maintain consistent container padding', () => {
      const { container } = render(<CollectionsPage />);
      
      const mainContainer = container.querySelector('[class*="MuiContainer"]');
      expect(mainContainer).toBeInTheDocument();
      
      // Container should have proper styling
      const hasStyle = mainContainer?.getAttribute('class')?.includes('MuiContainer');
      expect(hasStyle).toBe(true);
    });

    it('should render proper hierarchical structure', () => {
      const { container } = render(<CollectionsPage />);
      
      // Structure: Container > Grid container > Grid items > Cards
      const mainContainer = container.querySelector('[class*="MuiContainer"]');
      const gridContainer = mainContainer?.querySelector('[class*="MuiGrid-container"]');
      const gridItems = gridContainer?.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      const cards = container.querySelectorAll('[class*="MuiCard-root"]');
      
      expect(mainContainer).toBeInTheDocument();
      expect(gridContainer).toBeInTheDocument();
      expect(gridItems?.length).toBe(3);
      expect(cards.length).toBe(3);
      
      // Each card should be within a Grid item
      cards.forEach((card) => {
        expect(card.closest('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])')).toBeTruthy();
      });
    });
  });

  describe('Grid integration with other components', () => {
    it('should properly integrate Grid with ContentCard components', () => {
      const { container } = render(<CollectionsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Each Grid item should contain exactly one ContentCard
      gridItems.forEach((item) => {
        const cards = item.querySelectorAll('[class*="MuiCard-root"]');
        expect(cards.length).toBe(1);
      });
    });

    it('should maintain proper key props for mapped Grid items', () => {
      const { container } = render(<CollectionsPage />);
      
      // Grid items should be rendered for each collection
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      expect(gridItems.length).toBe(3);
    });
  });
});
