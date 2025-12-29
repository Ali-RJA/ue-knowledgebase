import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Grid2,
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Diagram not found</Typography>
      </Container>
    );
  }

  const relatedItems = getRelatedContent(diagram);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/diagrams" color="inherit">
          Diagrams
        </Link>
        <Typography color="text.primary">{diagram.title}</Typography>
      </Breadcrumbs>

      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {diagram.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={diagram.category} size="small" color="primary" />
              <Chip label="diagram" size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {diagram.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {diagram.summary}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
            <MermaidDiagram chart={mermaidSource} id={diagram.id} />
          </Box>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <RelatedContent items={relatedItems} />
          </Box>
        </Grid2>
      </Grid2>
    </Container>
  );
};
