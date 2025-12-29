import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { Box, IconButton, Tooltip, CircularProgress, Slider, Stack, Typography } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  interactive?: boolean; // Enable pan/zoom mode
}

// Counter for unique IDs across renders
let mermaidIdCounter = 0;

export const MermaidDiagram = ({ chart, id, interactive = true }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const reactId = useId();
  
  // Pan/zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !chart.trim()) {
        setError('No diagram content provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Generate truly unique ID for each render
      mermaidIdCounter++;
      const uniqueId = id 
        ? `${id.replace(/[^a-zA-Z0-9]/g, '')}-${mermaidIdCounter}` 
        : `mermaid-${reactId.replace(/:/g, '')}-${mermaidIdCounter}-${Date.now()}`;

      // Clean up any existing mermaid elements with this ID pattern
      const existingElements = document.querySelectorAll(`[id^="${uniqueId}"]`);
      existingElements.forEach(el => el.remove());

      try {
        // Validate basic mermaid syntax before rendering
        const trimmedChart = chart.trim();
        const validStarters = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline', 'quadrantChart', 'xychart', 'sankey', 'block'];
        const hasValidStart = validStarters.some(starter => 
          trimmedChart.toLowerCase().startsWith(starter.toLowerCase())
        );
        
        if (!hasValidStart) {
          throw new Error('Invalid mermaid diagram syntax');
        }

        const { svg } = await mermaid.render(uniqueId, trimmedChart);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(`Diagram error: ${errorMessage}`);
        setSvgContent('');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [chart, id, reactId]);

  // Reset view
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.2, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s / 1.2, 0.25));
  }, []);

  const handleSliderChange = useCallback((_: Event, value: number | number[]) => {
    setScale(value as number);
  }, []);

  // Ref for the zoomable container to attach native wheel listener
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // Native wheel event listener to properly prevent scroll
  useEffect(() => {
    const container = zoomContainerRef.current;
    if (!container || !interactive) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.max(0.25, Math.min(4, s * delta)));
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [interactive]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [interactive, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, interactive, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFullscreen = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        my: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        minHeight: 300,
      }}
    >
      {/* Toolbar */}
      {interactive && !loading && !error && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
            bgcolor: 'background.default',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            boxShadow: 1,
          }}
        >
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Slider
            value={scale}
            onChange={handleSliderChange}
            min={0.25}
            max={4}
            step={0.1}
            sx={{ width: 100 }}
            size="small"
          />
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Tooltip title="Reset view">
            <IconButton size="small" onClick={handleReset}>
              <CenterFocusStrongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* Fullscreen button */}
      {!loading && !error && (
        <Tooltip title="View fullscreen">
          <IconButton
            onClick={handleFullscreen}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            size="small"
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 2, color: 'error.main' }}>
          {error}
        </Box>
      )}
      
      {/* Pannable/zoomable container */}
      <Box
        ref={zoomContainerRef}
        sx={{
          display: loading || error ? 'none' : 'block',
          overflow: 'hidden',
          cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
          minHeight: 300,
          p: 2,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Box
          ref={elementRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            transform: interactive ? `translate(${position.x}px, ${position.y}px) scale(${scale})` : 'none',
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            '& svg': {
              maxWidth: interactive ? 'none' : '100%',
              height: 'auto',
            },
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </Box>
      
      {/* Instructions hint */}
      {interactive && !loading && !error && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          Drag to pan • Scroll to zoom
        </Typography>
      )}
    </Box>
  );
};
