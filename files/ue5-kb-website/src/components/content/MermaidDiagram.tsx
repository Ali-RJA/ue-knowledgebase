import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export const MermaidDiagram = ({ chart, id }: MermaidDiagramProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

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
      if (!elementRef.current || !chart) return;

      setLoading(true);
      setError(null);

      try {
        const { svg } = await mermaid.render(diagramId, chart);
        if (elementRef.current) {
          elementRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [chart, diagramId]);

  const handleFullscreen = () => {
    if (elementRef.current) {
      elementRef.current.requestFullscreen();
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        my: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 2, color: 'error.main' }}>
          {error}
        </Box>
      )}
      <Box
        ref={elementRef}
        sx={{
          display: loading || error ? 'none' : 'flex',
          justifyContent: 'center',
          '& svg': {
            maxWidth: '100%',
            height: 'auto',
          },
        }}
      />
      {!loading && !error && (
        <Tooltip title="View fullscreen">
          <IconButton
            onClick={handleFullscreen}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            size="small"
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
