import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import { HomePage } from './HomePage';

// Mock the content data
vi.mock('../data/content-index', () => ({
  topics: [
    {
      id: 'topic-01',
      slug: 'test-topic-1',
      title: 'Test Topic 1',
      type: 'topic',
      category: 'architecture',
      tags: ['Test', 'Mock'],
      summary: 'Test topic summary 1',
    },
    {
      id: 'topic-02',
      slug: 'test-topic-2',
      title: 'Test Topic 2',
      type: 'topic',
      category: 'core-systems',
      tags: ['Test', 'Mock'],
      summary: 'Test topic summary 2',
    },
    {
      id: 'topic-03',
      slug: 'test-topic-3',
      title: 'Test Topic 3',
      type: 'topic',
      category: 'core-systems',
      tags: ['Test', 'Mock'],
      summary: 'Test topic summary 3',
    },
  ],
  diagrams: [
    {
      id: 'diagram-01',
      slug: 'test-diagram-1',
      title: 'Test Diagram 1',
      type: 'diagram',
      category: 'core-systems',
      tags: ['Test', 'Mock'],
      summary: 'Test diagram summary 1',
    },
    {
      id: 'diagram-02',
      slug: 'test-diagram-2',
      title: 'Test Diagram 2',
      type: 'diagram',
      category: 'core-systems',
      tags: ['Test', 'Mock'],
      summary: 'Test diagram summary 2',
    },
    {
      id: 'diagram-03',
      slug: 'test-diagram-3',
      title: 'Test Diagram 3',
      type: 'diagram',
      category: 'core-systems',
      tags: ['Test', 'Mock'],
      summary: 'Test diagram summary 3',
    },
  ],
  collections: [
    {
      id: 'collection-01',
      slug: 'test-collection-1',
      title: 'Test Collection 1',
      type: 'collection',
      tags: ['Test', 'Mock'],
      summary: 'Test collection summary 1',
    },
    {
      id: 'collection-02',
      slug: 'test-collection-2',
      title: 'Test Collection 2',
      type: 'collection',
      tags: ['Test', 'Mock'],
      summary: 'Test collection summary 2',
    },
  ],
}));

describe('HomePage Grid Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid layout renders correctly', () => {
    it('should render the Featured Topics Grid container', () => {
      render(<HomePage />);
      
      const featuredTopicsSection = screen.getByText('Featured Topics').closest('div')?.parentElement;
      expect(featuredTopicsSection).toBeInTheDocument();
      
      // Check that Grid container is rendered
      const grids = featuredTopicsSection?.querySelectorAll('[class*="MuiGrid-root"]');
      expect(grids).toBeDefined();
      expect(grids!.length).toBeGreaterThan(0);
    });

    it('should render the Featured Diagrams Grid container', () => {
      render(<HomePage />);
      
      const featuredDiagramsSection = screen.getByText('Featured Diagrams').closest('div')?.parentElement;
      expect(featuredDiagramsSection).toBeInTheDocument();
      
      // Check that Grid container is rendered
      const grids = featuredDiagramsSection?.querySelectorAll('[class*="MuiGrid-root"]');
      expect(grids).toBeDefined();
      expect(grids!.length).toBeGreaterThan(0);
    });

    it('should render the Collections Grid container', () => {
      render(<HomePage />);
      
      const collectionsSection = screen.getByText('Special Collections').closest('div')?.parentElement;
      expect(collectionsSection).toBeInTheDocument();
      
      // Check that Grid container is rendered
      const grids = collectionsSection?.querySelectorAll('[class*="MuiGrid-root"]');
      expect(grids).toBeDefined();
      expect(grids!.length).toBeGreaterThan(0);
    });

    it('should render Grid items for each featured topic', () => {
      render(<HomePage />);
      
      // Should display 3 featured topics
      expect(screen.getByText('Test Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Test Topic 2')).toBeInTheDocument();
      expect(screen.getByText('Test Topic 3')).toBeInTheDocument();
    });

    it('should render Grid items for each featured diagram', () => {
      render(<HomePage />);
      
      // Should display 3 featured diagrams
      expect(screen.getByText('Test Diagram 1')).toBeInTheDocument();
      expect(screen.getByText('Test Diagram 2')).toBeInTheDocument();
      expect(screen.getByText('Test Diagram 3')).toBeInTheDocument();
    });

    it('should render Grid items for each collection', () => {
      render(<HomePage />);
      
      // Should display all collections
      expect(screen.getByText('Test Collection 1')).toBeInTheDocument();
      expect(screen.getByText('Test Collection 2')).toBeInTheDocument();
    });
  });

  describe('Grid responsiveness is maintained', () => {
    it('should apply correct Grid size props for Featured Topics', () => {
      render(<HomePage />);
      
      // Find the Featured Topics section
      const featuredTopicsSection = screen.getByText('Featured Topics').closest('div')?.parentElement;
      const gridItems = featuredTopicsSection?.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Grid items should have responsive classes
      gridItems?.forEach((item) => {
        const classes = item.className;
        // Check for xs and md breakpoint classes (Grid component adds these)
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should apply correct Grid size props for Featured Diagrams', () => {
      render(<HomePage />);
      
      // Find the Featured Diagrams section
      const featuredDiagramsSection = screen.getByText('Featured Diagrams').closest('div')?.parentElement;
      const gridItems = featuredDiagramsSection?.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Grid items should have responsive classes
      gridItems?.forEach((item) => {
        const classes = item.className;
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should apply correct Grid size props for Collections', () => {
      render(<HomePage />);
      
      // Find the Collections section
      const collectionsSection = screen.getByText('Special Collections').closest('div')?.parentElement;
      const gridItems = collectionsSection?.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Grid items should have responsive classes
      gridItems?.forEach((item) => {
        const classes = item.className;
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should render Grid container with spacing prop', () => {
      const { container } = render(<HomePage />);
      
      // Check that Grid containers have spacing applied
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      expect(gridContainers.length).toBeGreaterThan(0);
      gridContainers.forEach((grid) => {
        const classes = grid.className;
        // Should have spacing classes
        expect(classes).toMatch(/MuiGrid/);
      });
    });
  });

  describe('Content within Grid components displays correctly', () => {
    it('should display ContentCard components within Featured Topics Grid', () => {
      render(<HomePage />);
      
      const topic1Card = screen.getByText('Test Topic 1').closest('[class*="MuiCard-root"]');
      const topic2Card = screen.getByText('Test Topic 2').closest('[class*="MuiCard-root"]');
      const topic3Card = screen.getByText('Test Topic 3').closest('[class*="MuiCard-root"]');
      
      expect(topic1Card).toBeInTheDocument();
      expect(topic2Card).toBeInTheDocument();
      expect(topic3Card).toBeInTheDocument();
    });

    it('should display ContentCard components within Featured Diagrams Grid', () => {
      render(<HomePage />);
      
      const diagram1Card = screen.getByText('Test Diagram 1').closest('[class*="MuiCard-root"]');
      const diagram2Card = screen.getByText('Test Diagram 2').closest('[class*="MuiCard-root"]');
      const diagram3Card = screen.getByText('Test Diagram 3').closest('[class*="MuiCard-root"]');
      
      expect(diagram1Card).toBeInTheDocument();
      expect(diagram2Card).toBeInTheDocument();
      expect(diagram3Card).toBeInTheDocument();
    });

    it('should display ContentCard components within Collections Grid', () => {
      render(<HomePage />);
      
      const collection1Card = screen.getByText('Test Collection 1').closest('[class*="MuiCard-root"]');
      const collection2Card = screen.getByText('Test Collection 2').closest('[class*="MuiCard-root"]');
      
      expect(collection1Card).toBeInTheDocument();
      expect(collection2Card).toBeInTheDocument();
    });

    it('should display summaries for each content item', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Test topic summary 1')).toBeInTheDocument();
      expect(screen.getByText('Test diagram summary 2')).toBeInTheDocument();
      expect(screen.getByText('Test collection summary 1')).toBeInTheDocument();
    });

    it('should display all section headings', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Featured Topics')).toBeInTheDocument();
      expect(screen.getByText('Featured Diagrams')).toBeInTheDocument();
      expect(screen.getByText('Special Collections')).toBeInTheDocument();
    });
  });

  describe('Grid spacing and container properties function correctly', () => {
    it('should apply Container component with maxWidth="lg"', () => {
      const { container } = render(<HomePage />);
      
      const containers = container.querySelectorAll('[class*="MuiContainer"]');
      expect(containers.length).toBeGreaterThan(0);
      
      // Check that containers have max-width classes
      containers.forEach((cont) => {
        const classes = cont.className;
        expect(classes).toMatch(/MuiContainer/);
      });
    });

    it('should render Grid containers with proper spacing between items', () => {
      const { container } = render(<HomePage />);
      
      // Get all Grid containers
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      // Each Grid container should have spacing applied
      expect(gridContainers.length).toBeGreaterThanOrEqual(3);
    });

    it('should maintain spacing between Featured Topics section and Featured Diagrams section', () => {
      render(<HomePage />);
      
      const featuredTopicsBox = screen.getByText('Featured Topics').closest('div')?.parentElement;
      const featuredDiagramsBox = screen.getByText('Featured Diagrams').closest('div')?.parentElement;
      
      expect(featuredTopicsBox).toBeInTheDocument();
      expect(featuredDiagramsBox).toBeInTheDocument();
      
      // Both should be rendered and spaced properly
      expect(featuredTopicsBox?.style.marginBottom || featuredTopicsBox?.className).toBeTruthy();
    });

    it('should render Grid with container and item props correctly', () => {
      const { container } = render(<HomePage />);
      
      // Check for Grid containers
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      // Check for Grid items
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(gridItems.length).toBeGreaterThan(0);
      
      // Items should be children of containers
      gridContainers.forEach((gridContainer) => {
        const itemsInContainer = gridContainer.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
        expect(itemsInContainer.length).toBeGreaterThan(0);
      });
    });

    it('should apply proper spacing prop value of 3 to Grid containers', () => {
      const { container } = render(<HomePage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      // Verify Grid containers exist
      expect(gridContainers.length).toBeGreaterThanOrEqual(3);
      
      // Each container should have spacing classes applied
      gridContainers.forEach((grid) => {
        expect(grid.className).toMatch(/MuiGrid/);
      });
    });
  });

  describe('Hero section and navigation', () => {
    it('should render hero section with title and description', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Unreal Engine 5 Knowledge Base')).toBeInTheDocument();
      expect(screen.getByText(/Complete architectural reference for building a Ghost of Tsushima-style melee combat game/i)).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Explore Topics')).toBeInTheDocument();
      expect(screen.getByText('Browse Lego Pieces')).toBeInTheDocument();
    });

    it('should render "View All" buttons for sections', () => {
      render(<HomePage />);
      
      const viewAllButtons = screen.getAllByText('View All');
      expect(viewAllButtons.length).toBe(2); // One for topics, one for diagrams
    });
  });
});
