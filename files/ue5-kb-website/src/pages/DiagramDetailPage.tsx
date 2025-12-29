import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getContentBySlug, getRelatedContent } from '../data/content-index';
import type { Diagram } from '../types/content';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const DiagramDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [mermaidSource, setMermaidSource] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiagram = async () => {
      if (!slug) return;

      const foundDiagram = getContentBySlug(slug) as Diagram;
      if (foundDiagram && foundDiagram.type === 'diagram') {
        setDiagram(foundDiagram);

        // Load mermaid content
        try {
          const response = await fetch(`/content/${foundDiagram.sourcePath}`);
          if (response.ok) {
            const text = await response.text();
            setMermaidSource(text);
          }
        } catch (error) {
          console.error('Error loading diagram:', error);
          setMermaidSource('graph TD\n  A[Content not available]');
        }
      }
      setLoading(false);
    };

    loadDiagram();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!diagram) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Diagram not found</Typography>
      </Box>
    );
  }

  const relatedItems = getRelatedContent(diagram);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/diagrams" color="inherit">
          Diagrams
        </Link>
        <Typography color="text.primary">{diagram.title}</Typography>
      </Breadcrumbs>

      {/* Header section with title, tags, and related content inline */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {diagram.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={diagram.category} size="small" color="primary" />
              <Chip label="diagram" size="small" variant="outlined" />
            </Box>
          </Box>
          {relatedItems.length > 0 && (
            <Box sx={{ flexShrink: 0 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {diagram.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {diagram.summary}
        </Typography>
      </Box>

      {/* Full-width diagram */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, width: '100%' }}>
        <MermaidDiagram chart={mermaidSource} id={diagram.id} />
      </Box>
    </Box>
  );
};

