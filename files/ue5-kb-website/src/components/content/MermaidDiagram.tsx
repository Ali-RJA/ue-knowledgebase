import { useEffect, useRef, useState, useId } from 'react';
import { Box, IconButton, Tooltip, CircularProgress, Typography, Chip, Stack } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import MouseIcon from '@mui/icons-material/Mouse';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  interactive?: boolean;
}

// Counter for unique IDs across renders
let mermaidIdCounter = 0;

// Global scroll zoom state - shared across all diagram instances on the page
let globalScrollZoomEnabled = true;
const scrollZoomListeners = new Set<(enabled: boolean) => void>();

const setGlobalScrollZoom = (enabled: boolean) => {
  globalScrollZoomEnabled = enabled;
  scrollZoomListeners.forEach(listener => listener(enabled));
};

const subscribeToScrollZoom = (listener: (enabled: boolean) => void) => {
  scrollZoomListeners.add(listener);
  return () => scrollZoomListeners.delete(listener);
};

// Mermaid configuration matching the reference HTML that renders beautifully
const getMermaidConfig = (): MermaidConfig => ({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1a1a2e',
    primaryTextColor: '#eee',
    primaryBorderColor: '#4a4a6a',
    lineColor: '#61dafb',
    secondaryColor: '#16213e',
    tertiaryColor: '#0f3460',
    noteBkgColor: '#ffd93d',
    noteTextColor: '#000',
    fontSize: '14px',
  },
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 30,
    rankSpacing: 50,
  },
  sequence: {
    useMaxWidth: false,
  },
  securityLevel: 'loose',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
});

// Toolbar controls component that uses the transform context
const DiagramControls = ({ 
  scale, 
  onFullscreen,
  isFullscreen,
  scrollZoomEnabled,
  onToggleScrollZoom,
}: { 
  scale: number;
  onFullscreen: () => void;
  isFullscreen: boolean;
  scrollZoomEnabled: boolean;
  onToggleScrollZoom: () => void;
}) => {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        bgcolor: 'rgba(18, 18, 18, 0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Tooltip title="Zoom out (-10%)">
        <IconButton size="small" onClick={() => zoomOut(0.1)} sx={{ color: 'grey.300' }}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Chip
        label={`${Math.round(scale * 100)}%`}
        size="small"
        sx={{
          height: 24,
          minWidth: 52,
          bgcolor: 'rgba(97, 218, 251, 0.15)',
          color: '#61dafb',
          fontWeight: 600,
          fontSize: '0.75rem',
          '& .MuiChip-label': { px: 1 },
        }}
      />
      
      <Tooltip title="Zoom in (+10%)">
        <IconButton size="small" onClick={() => zoomIn(0.1)} sx={{ color: 'grey.300' }}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ width: 1, height: 20, borderLeft: 1, borderColor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
      
      <Tooltip title="Reset to 100%">
        <IconButton size="small" onClick={() => resetTransform()} sx={{ color: 'grey.300' }}>
          <CenterFocusStrongIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Fit to view">
        <IconButton size="small" onClick={() => centerView(0.8)} sx={{ color: 'grey.300' }}>
          <FitScreenIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
        <IconButton size="small" onClick={onFullscreen} sx={{ color: 'grey.300' }}>
          {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      
      <Box sx={{ width: 1, height: 20, borderLeft: 1, borderColor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
      
      <Tooltip title={scrollZoomEnabled ? 'Scroll zooms diagram (click to toggle)' : 'Scroll moves page (click to toggle)'}>
        <Chip
          icon={<MouseIcon sx={{ fontSize: 14 }} />}
          label={scrollZoomEnabled ? 'Zoom' : 'Scroll'}
          size="small"
          onClick={onToggleScrollZoom}
          sx={{
            height: 24,
            cursor: 'pointer',
            bgcolor: scrollZoomEnabled ? 'rgba(97, 218, 251, 0.2)' : 'rgba(255,255,255,0.1)',
            color: scrollZoomEnabled ? '#61dafb' : 'grey.400',
            border: scrollZoomEnabled ? '1px solid rgba(97, 218, 251, 0.4)' : '1px solid transparent',
            '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' },
            '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
            '&:hover': {
              bgcolor: scrollZoomEnabled ? 'rgba(97, 218, 251, 0.3)' : 'rgba(255,255,255,0.15)',
            },
          }}
        />
      </Tooltip>
    </Stack>
  );
};

export const MermaidDiagram = ({ chart, id, interactive = true }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [currentScale, setCurrentScale] = useState(0.7);
  const [scrollZoomEnabled, setScrollZoomEnabled] = useState(globalScrollZoomEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactId = useId();

  // Subscribe to global scroll zoom changes
  useEffect(() => {
    const unsubscribe = subscribeToScrollZoom(setScrollZoomEnabled);
    return () => { unsubscribe(); };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleScrollZoom = () => {
    setGlobalScrollZoom(!scrollZoomEnabled);
  };

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize(getMermaidConfig());
  }, []);

  // Render the diagram
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
        const validStarters = [
          'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
          'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 
          'gitGraph', 'mindmap', 'timeline', 'quadrantChart', 
          'xychart', 'sankey', 'block'
        ];
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

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  // Non-interactive mode - just render the SVG
  if (!interactive) {
    return (
      <Box
        sx={{
          my: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          p: 2,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
        )}
        {!loading && !error && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              '& svg': { maxWidth: '100%', height: 'auto' }
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        my: 3,
        bgcolor: '#0d1117',
        borderRadius: 2,
        border: 1,
        borderColor: 'rgba(97, 218, 251, 0.3)',
        overflow: 'hidden',
        height: '60vh',
        minHeight: 400,
        // Fullscreen styles
        '&:fullscreen': {
          height: '100vh',
          bgcolor: '#0d1117',
        },
      }}
    >
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: 2,
        }}>
          <CircularProgress sx={{ color: '#61dafb' }} />
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            Rendering diagram...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Box sx={{ 
          p: 3, 
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <Typography>{error}</Typography>
        </Box>
      )}
      
      {!loading && !error && svgContent && (
        <TransformWrapper
          initialScale={0.7}
          minScale={0.1}
          maxScale={5}
          centerOnInit={true}
          wheel={{ disabled: !scrollZoomEnabled, step: 0.05 }}
          panning={{ velocityDisabled: true }}
          doubleClick={{ disabled: false, mode: 'reset' }}
          onTransformed={(_, state) => {
            setCurrentScale(state.scale);
          }}
        >
          <DiagramControls 
            scale={currentScale} 
            onFullscreen={handleFullscreen}
            isFullscreen={isFullscreen}
            scrollZoomEnabled={scrollZoomEnabled}
            onToggleScrollZoom={handleToggleScrollZoom}
          />
          
          <Box
            onContextMenu={(e) => {
              e.preventDefault();
              handleToggleScrollZoom();
            }}
            sx={{ width: '100%', height: '100%' }}
          >
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
              }}
              contentStyle={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // Large padding to allow panning beyond diagram edges
                padding: '50vh 50vw',
              }}
            >
              {/* The SVG from mermaid - rendered untouched */}
              <Box
                sx={{
                  '& svg': {
                    display: 'block',
                    // Don't constrain dimensions - let mermaid decide
                    maxWidth: 'none',
                    height: 'auto',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </TransformComponent>
          </Box>
          
          {/* Instructions hint */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.5,
              pointerEvents: 'none',
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              color: 'grey.400',
              fontSize: '0.7rem',
            }}
          >
            Drag to pan • {scrollZoomEnabled ? 'Scroll to zoom' : 'Scroll disabled'} • Right-click to toggle • Double-click to reset
          </Typography>
        </TransformWrapper>
      )}
    </Box>
  );
};
