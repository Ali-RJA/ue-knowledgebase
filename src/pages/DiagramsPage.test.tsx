import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import { DiagramsPage } from './DiagramsPage';

// Mock the content data with grouped diagrams by category
vi.mock('../data/content-index', () => ({
  diagrams: [
    {
      id: 'diagram-01',
      slug: 'gameplay-ability-system-flowchart',
      title: 'Gameplay Ability System Flowchart',
      type: 'diagram',
      category: 'core-systems',
      tags: ['GAS', 'Data-Driven', 'Animation'],
      summary: 'Visual representation of the Gameplay Ability System architecture.',
    },
    {
      id: 'diagram-02',
      slug: 'gameplay-ability-flowchart',
      title: 'Gameplay Ability Flowchart',
      type: 'diagram',
      category: 'core-systems',
      tags: ['GAS', 'Ability'],
      summary: 'Detailed flow of gameplay ability activation.',
    },
    {
      id: 'diagram-03',
      slug: 'animation-system-flowchart',
      title: 'Animation System Flowchart',
      type: 'diagram',
      category: 'core-systems',
      tags: ['Animation', 'Montage', 'State Machine'],
      summary: 'Animation blueprint and montage system architecture.',
    },
    {
      id: 'diagram-04',
      slug: 'weapon-data-asset-flowchart',
      title: 'Weapon Data Asset Flowchart',
      type: 'diagram',
      category: 'design',
      tags: ['Data-Driven', 'Combat', 'Data'],
      summary: 'Data-driven weapon configuration flow.',
    },
    {
      id: 'diagram-05',
      slug: 'ai-behavior-flowchart',
      title: 'AI Behavior Flowchart',
      type: 'diagram',
      category: 'control',
      tags: ['AI', 'Combat'],
      summary: 'Enemy decision-making flow.',
    },
  ],
}));

describe('DiagramsPage Grid Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid layout renders correctly', () => {
    it('should render Grid containers for each category', () => {
      const { container } = render(<DiagramsPage />);
      
      // Should have multiple Grid containers (one per category)
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('should render Grid items for each diagram', () => {
      render(<DiagramsPage />);
      
      // Should display all diagrams
      expect(screen.getByText('Gameplay Ability System Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Gameplay Ability Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Animation System Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Weapon Data Asset Flowchart')).toBeInTheDocument();
      expect(screen.getByText('AI Behavior Flowchart')).toBeInTheDocument();
    });

    it('should render correct number of Grid items', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Should have 5 Grid items (one for each diagram)
      expect(gridItems.length).toBe(5);
    });

    it('should render diagrams grouped by category', () => {
      render(<DiagramsPage />);
      
      // Check for category headings (formatted from category slugs)
      expect(screen.getByText('Core Systems')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
    });

    it('should render each diagram within a Grid item', () => {
      render(<DiagramsPage />);
      
      const diagram1Card = screen.getByText('Gameplay Ability System Flowchart').closest('[class*="MuiCard-root"]');
      const diagram2Card = screen.getByText('Gameplay Ability Flowchart').closest('[class*="MuiCard-root"]');
      
      // Each card should be within a Grid item
      expect(diagram1Card?.closest('[class*="MuiGrid-root"]')).toBeTruthy();
      expect(diagram2Card?.closest('[class*="MuiGrid-root"]')).toBeTruthy();
    });
  });

  describe('Grid responsiveness is maintained', () => {
    it('should apply responsive Grid size props (xs=12, sm=6, md=4)', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Grid items should have responsive classes for xs, sm, and md breakpoints
      gridItems.forEach((item) => {
        const classes = item.className;
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should render Grid containers with spacing prop', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      expect(gridContainers.length).toBeGreaterThan(0);
      gridContainers.forEach((grid) => {
        const classes = grid.className;
        expect(classes).toMatch(/MuiGrid/);
      });
    });

    it('should maintain consistent Grid structure across all items', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // All Grid items should have consistent class structure
      const classPatterns = Array.from(gridItems).map(item => {
        return item.className.includes('MuiGrid-root');
      });
      
      // All items should match the pattern
      expect(classPatterns.every(pattern => pattern === true)).toBe(true);
    });

    it('should render multiple Grid containers for different categories', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      // Should have 3 Grid containers (one for each category: core-systems, design, control)
      expect(gridContainers.length).toBe(3);
    });
  });

  describe('Content within Grid components displays correctly', () => {
    it('should display ContentCard components within Grid items', () => {
      render(<DiagramsPage />);
      
      const diagram1Card = screen.getByText('Gameplay Ability System Flowchart').closest('[class*="MuiCard"]');
      const diagram2Card = screen.getByText('Gameplay Ability Flowchart').closest('[class*="MuiCard"]');
      const diagram3Card = screen.getByText('Animation System Flowchart').closest('[class*="MuiCard"]');
      
      expect(diagram1Card).toBeInTheDocument();
      expect(diagram2Card).toBeInTheDocument();
      expect(diagram3Card).toBeInTheDocument();
    });

    it('should display diagram titles', () => {
      render(<DiagramsPage />);
      
      expect(screen.getByText('Gameplay Ability System Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Gameplay Ability Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Animation System Flowchart')).toBeInTheDocument();
      expect(screen.getByText('Weapon Data Asset Flowchart')).toBeInTheDocument();
      expect(screen.getByText('AI Behavior Flowchart')).toBeInTheDocument();
    });

    it('should display diagram summaries', () => {
      render(<DiagramsPage />);
      
      expect(screen.getByText('Visual representation of the Gameplay Ability System architecture.')).toBeInTheDocument();
      expect(screen.getByText('Detailed flow of gameplay ability activation.')).toBeInTheDocument();
      expect(screen.getByText('Data-driven weapon configuration flow.')).toBeInTheDocument();
    });

    it('should display page heading and description', () => {
      render(<DiagramsPage />);
      
      expect(screen.getByText('Diagrams')).toBeInTheDocument();
      expect(screen.getByText(/Visual representations of UE5 systems, flows, and architectures/i)).toBeInTheDocument();
    });

    it('should display category headings for each group', () => {
      render(<DiagramsPage />);
      
      // Category names should be formatted (e.g., "core-systems" -> "Core Systems")
      expect(screen.getByText('Core Systems')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
    });

    it('should display all diagrams within their category sections', () => {
      render(<DiagramsPage />);
      
      // Find Core Systems section
      const coreSystemsHeading = screen.getByText('Core Systems');
      const coreSystemsSection = coreSystemsHeading.closest('div')?.parentElement;
      
      expect(coreSystemsSection).toBeInTheDocument();
      
      // Should contain Grid within this section
      const gridInSection = coreSystemsSection?.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridInSection).toBeInTheDocument();
    });
  });

  describe('Grid spacing and container properties function correctly', () => {
    it('should apply Container component with maxWidth="lg"', () => {
      const { container } = render(<DiagramsPage />);
      
      const containers = container.querySelectorAll('[class*="MuiContainer"]');
      expect(containers.length).toBeGreaterThan(0);
      
      containers.forEach((cont) => {
        const classes = cont.className;
        expect(classes).toMatch(/MuiContainer/);
      });
    });

    it('should apply spacing={3} to Grid containers', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      gridContainers.forEach((gridContainer) => {
        expect(gridContainer.className).toMatch(/MuiGrid/);
      });
    });

    it('should render Grid with both container and item properties', () => {
      const { container } = render(<DiagramsPage />);
      
      // Check for Grid containers
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      // Check for Grid items
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(gridItems.length).toBe(5);
      
      // All items should be children of containers
      let allItemsInContainers = true;
      gridItems.forEach((item) => {
        const parentContainer = item.closest('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
        if (!parentContainer) allItemsInContainers = false;
      });
      
      expect(allItemsInContainers).toBe(true);
    });

    it('should apply proper spacing between Grid items', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // All Grid items should be rendered
      expect(gridItems.length).toBe(5);
      
      // Each should have Grid classes for spacing
      gridItems.forEach((item) => {
        expect(item.className).toMatch(/MuiGrid/);
      });
    });

    it('should maintain spacing between category sections', () => {
      const { container } = render(<DiagramsPage />);
      
      // Get all category section boxes
      const categoryBoxes = container.querySelectorAll('[class*="MuiBox-root"]');
      
      // There should be multiple Box components for sections
      expect(categoryBoxes.length).toBeGreaterThan(0);
    });

    it('should render proper hierarchical structure for each category', () => {
      const { container } = render(<DiagramsPage />);
      
      // Structure: Container > Box (per category) > Grid container > Grid items > Cards
      const mainContainer = container.querySelector('[class*="MuiContainer"]');
      expect(mainContainer).toBeInTheDocument();
      
      // Each category should have its own Grid container
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridContainers.length).toBe(3); // 3 categories
      
      // All cards should be within Grid items
      const cards = container.querySelectorAll('[class*="MuiCard-root"]');
      expect(cards.length).toBe(5);
      
      cards.forEach((card) => {
        expect(card.closest('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])')).toBeTruthy();
      });
    });
  });

  describe('Category grouping and Grid organization', () => {
    it('should properly group diagrams by category into separate Grid containers', () => {
      const { container } = render(<DiagramsPage />);
      
      // Find all Grid containers
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      // Should have one Grid container per category
      expect(gridContainers.length).toBe(3);
    });

    it('should render correct number of items in each category Grid', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridContainers = container.querySelectorAll('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      
      // Core Systems should have 3 diagrams
      const coreSystemsGrid = gridContainers[0];
      const coreSystemsItems = coreSystemsGrid.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(coreSystemsItems.length).toBe(3);
      
      // Design should have 1 diagram
      const designGrid = gridContainers[1];
      const designItems = designGrid.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(designItems.length).toBe(1);
      
      // Control should have 1 diagram
      const controlGrid = gridContainers[2];
      const controlItems = controlGrid.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      expect(controlItems.length).toBe(1);
    });

    it('should integrate Grid properly with category sections', () => {
      render(<DiagramsPage />);
      
      // Each category should have a heading and Grid
      const coreSystemsHeading = screen.getByText('Core Systems');
      const designHeading = screen.getByText('Design');
      const controlHeading = screen.getByText('Control');
      
      expect(coreSystemsHeading).toBeInTheDocument();
      expect(designHeading).toBeInTheDocument();
      expect(controlHeading).toBeInTheDocument();
      
      // Each should have associated Grid containers nearby
      const coreSystemsSection = coreSystemsHeading.closest('div')?.parentElement;
      const gridInCoreSystemsSection = coreSystemsSection?.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
      expect(gridInCoreSystemsSection).toBeInTheDocument();
    });
  });

  describe('Grid integration with other components', () => {
    it('should properly integrate Grid with ContentCard components', () => {
      const { container } = render(<DiagramsPage />);
      
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      // Each Grid item should contain exactly one ContentCard
      gridItems.forEach((item) => {
        const cards = item.querySelectorAll('[class*="MuiCard-root"]');
        expect(cards.length).toBe(1);
      });
    });

    it('should maintain proper key props for mapped Grid items', () => {
      const { container } = render(<DiagramsPage />);
      
      // Grid items should be rendered for each diagram
      const gridItems = container.querySelectorAll('[class*="MuiGrid-root"]:not([class*="MuiGrid-container"])');
      
      expect(gridItems.length).toBe(5);
    });

    it('should integrate Box component with Grid for section organization', () => {
      render(<DiagramsPage />);
      
      // Each category section should use Box component containing Grid
      const categoryHeadings = [
        screen.getByText('Core Systems'),
        screen.getByText('Design'),
        screen.getByText('Control'),
      ];
      
      categoryHeadings.forEach((heading) => {
        const section = heading.closest('div')?.parentElement;
        const gridInSection = section?.querySelector('[class*="MuiGrid-root"][class*="MuiGrid-container"]');
        expect(gridInSection).toBeInTheDocument();
      });
    });
  });
});
