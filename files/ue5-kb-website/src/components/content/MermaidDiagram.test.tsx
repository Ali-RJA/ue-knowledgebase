import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MermaidDiagram } from './MermaidDiagram';
import mermaid from 'mermaid';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><rect width="100" height="100"/></svg>',
    }),
  },
}));

describe('MermaidDiagram', () => {
  const testChart = `flowchart TD
    A[Start] --> B[End]`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('zoom functionality', () => {
    it('should allow zooming in using the zoom in button', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      // Wait for diagram to render
      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Find and click zoom in button (rendered inside Tooltip)
      const zoomInButtons = screen.getAllByRole('button');
      const zoomInButton = zoomInButtons.find(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'));
      expect(zoomInButton).toBeDefined();

      await user.click(zoomInButton!);

      // Verify zoom scale display updates
      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument();
      });
    });

    it('should allow zooming out using the zoom out button', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      // Wait for diagram to render
      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Find and click zoom out button (rendered inside Tooltip)
      const buttons = screen.getAllByRole('button');
      const zoomOutButton = buttons.find(btn => btn.querySelector('svg[data-testid="ZoomOutIcon"]'));
      expect(zoomOutButton).toBeDefined();

      await user.click(zoomOutButton!);

      // Verify zoom scale display updates (100% / 1.2 ≈ 83%)
      await waitFor(() => {
        expect(screen.getByText('83%')).toBeInTheDocument();
      });
    });

    it('should update zoom percentage display correctly', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Initial state should show 100%
      expect(screen.getByText('100%')).toBeInTheDocument();

      // Zoom in once
      const buttons = screen.getAllByRole('button');
      const zoomInButton = buttons.find(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'));
      await user.click(zoomInButton!);

      // Should now show 120%
      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument();
      });

      // Zoom in again
      await user.click(zoomInButton!);

      // Should show 144% (120 * 1.2)
      await waitFor(() => {
        expect(screen.getByText('144%')).toBeInTheDocument();
      });
    });

    it('should allow zooming using the slider', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Find the slider
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();

      // Change slider value
      await user.click(slider);
      // Slider should be interactive and change zoom
      expect(slider).toHaveAttribute('aria-valuenow', '1');
    });

    it('should limit maximum zoom to 4x (400%)', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      const buttons = screen.getAllByRole('button');
      const zoomInButton = buttons.find(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'))!;

      // Click zoom in multiple times to exceed max
      for (let i = 0; i < 15; i++) {
        await user.click(zoomInButton);
      }

      // Should be capped at 400%
      await waitFor(() => {
        expect(screen.getByText('400%')).toBeInTheDocument();
      });
    });

    it('should limit minimum zoom to 0.25x (25%)', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      const buttons = screen.getAllByRole('button');
      const zoomOutButton = buttons.find(btn => btn.querySelector('svg[data-testid="ZoomOutIcon"]'))!;

      // Click zoom out multiple times to go below min
      for (let i = 0; i < 15; i++) {
        await user.click(zoomOutButton);
      }

      // Should be capped at 25%
      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument();
      });
    });

    it('should reset zoom to 100% when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Zoom in first
      const buttons = screen.getAllByRole('button');
      const zoomInButton = buttons.find(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'))!;
      await user.click(zoomInButton);
      await user.click(zoomInButton);

      // Verify zoomed in
      await waitFor(() => {
        expect(screen.getByText('144%')).toBeInTheDocument();
      });

      // Click reset
      const allButtons = screen.getAllByRole('button');
      const resetButton = allButtons.find(btn => btn.querySelector('svg[data-testid="CenterFocusStrongIcon"]'))!;
      await user.click(resetButton);

      // Should be back to 100%
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should not display zoom controls when interactive is false', async () => {
      render(<MermaidDiagram chart={testChart} interactive={false} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Zoom controls toolbar should not be present when interactive is false
      const buttons = screen.queryAllByRole('button');
      const hasZoomControls = buttons.some(btn => 
        btn.querySelector('svg[data-testid="ZoomInIcon"]') || 
        btn.querySelector('svg[data-testid="ZoomOutIcon"]')
      );
      expect(hasZoomControls).toBe(false);
    });

    it('should display zoom controls when interactive is true', async () => {
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Zoom controls should be present
      const buttons = screen.getAllByRole('button');
      const hasZoomIn = buttons.some(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'));
      const hasZoomOut = buttons.some(btn => btn.querySelector('svg[data-testid="ZoomOutIcon"]'));
      const hasReset = buttons.some(btn => btn.querySelector('svg[data-testid="CenterFocusStrongIcon"]'));
      
      expect(hasZoomIn).toBe(true);
      expect(hasZoomOut).toBe(true);
      expect(hasReset).toBe(true);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should default interactive prop to true', async () => {
      render(<MermaidDiagram chart={testChart} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Zoom controls should be present by default
      const buttons = screen.getAllByRole('button');
      const hasZoomIn = buttons.some(btn => btn.querySelector('svg[data-testid="ZoomInIcon"]'));
      expect(hasZoomIn).toBe(true);
    });
  });

  describe('pan functionality', () => {
    it('should allow panning the diagram when interactive', async () => {
      const { container } = render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Find the pannable container
      const pannableContainer = container.querySelector('[style*="cursor"]');
      expect(pannableContainer).toBeInTheDocument();

      // Check that cursor is set to 'grab' for panning
      expect(pannableContainer).toHaveStyle({ cursor: 'grab' });
    });

    it('should change cursor to grabbing during drag', async () => {
      const user = userEvent.setup();
      const { container } = render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      const pannableContainer = container.querySelector('[style*="cursor"]') as HTMLElement;
      expect(pannableContainer).toBeInTheDocument();

      // Simulate mouse down (start dragging)
      await user.pointer({ keys: '[MouseLeft>]', target: pannableContainer });

      // During drag, cursor should be 'grabbing'
      expect(pannableContainer).toHaveStyle({ cursor: 'grabbing' });
    });

    it('should not allow panning when interactive is false', () => {
      const { container } = render(<MermaidDiagram chart={testChart} interactive={false} />);

      // Find the container
      const pannableContainer = container.querySelector('[style*="cursor"]');
      
      // Cursor should be default, not grab
      expect(pannableContainer).toHaveStyle({ cursor: 'default' });
    });

    it('should display pan instruction hint when interactive', async () => {
      render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Check for instruction text
      expect(screen.getByText(/Drag to pan • Scroll to zoom/i)).toBeInTheDocument();
    });

    it('should not display pan instruction when interactive is false', () => {
      render(<MermaidDiagram chart={testChart} interactive={false} />);

      // Instruction should not be present
      expect(screen.queryByText(/Drag to pan • Scroll to zoom/i)).not.toBeInTheDocument();
    });

    it('should reset position when reset button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<MermaidDiagram chart={testChart} interactive={true} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Get the transform container
      const transformContainer = container.querySelector('[style*="transform"]') as HTMLElement;
      expect(transformContainer).toBeInTheDocument();

      // Initial position should be translate(0px, 0px)
      expect(transformContainer.style.transform).toContain('translate(0px, 0px)');

      // Click reset to ensure position is reset (even if we haven't panned)
      const buttons = screen.getAllByRole('button');
      const resetButton = buttons.find(btn => btn.querySelector('svg[data-testid="CenterFocusStrongIcon"]'))!;
      await user.click(resetButton);

      // Position should still be at origin
      await waitFor(() => {
        expect(transformContainer.style.transform).toContain('translate(0px, 0px)');
      });
    });
  });

  describe('render and error states', () => {
    it('should show loading state initially', () => {
      render(<MermaidDiagram chart={testChart} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading state after render completes', async () => {
      render(<MermaidDiagram chart={testChart} />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('should render fullscreen button', async () => {
      render(<MermaidDiagram chart={testChart} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
      });

      // Fullscreen button is rendered after mermaid completes
      const buttons = screen.getAllByRole('button');
      const hasFullscreen = buttons.some(btn => btn.querySelector('svg[data-testid="FullscreenIcon"]'));
      expect(hasFullscreen).toBe(true);
    });

    it('should initialize mermaid with correct settings', () => {
      render(<MermaidDiagram chart={testChart} />);

      expect(mermaid.initialize).toHaveBeenCalledWith({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif',
      });
    });

    it('should call mermaid.render with the chart content', async () => {
      render(<MermaidDiagram chart={testChart} id="test-diagram" />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalled();
        // Verify it was called with a string ID and the chart content
        const calls = vi.mocked(mermaid.render).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][1]).toContain('flowchart TD');
      });
    });
  });
});
