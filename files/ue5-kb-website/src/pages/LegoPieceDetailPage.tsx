import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getRelatedContent, legoPieces } from '../data/content-index';
import type { LegoPiece } from '../types/content';
import { CodeBlock } from '../components/content/CodeBlock';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const LegoPieceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const piece = legoPieces.find(p => p.slug === slug) as LegoPiece | undefined;

  if (!piece) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Lego piece not found</Typography>
      </Box>
    );
  }

  const relatedItems = getRelatedContent(piece);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/lego-pieces" color="inherit">
          Lego Pieces
        </Link>
        <Typography color="text.primary">{piece.title}</Typography>
      </Breadcrumbs>

      {/* Header section with title, tags, and related content inline */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {piece.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={piece.pieceType} size="small" color="primary" />
              <Chip label="lego-piece" size="small" variant="outlined" />
            </Box>
          </Box>
          {relatedItems.length > 0 && (
            <Box sx={{ flexShrink: 0 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {piece.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {piece.summary}
        </Typography>
      </Box>

      {/* Diagram - full width */}
      {piece.diagram && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            Flow Diagram
          </Typography>
          <MermaidDiagram chart={piece.diagram} id={`${piece.id}-diagram`} />
        </Box>
      )}

      {/* Code Snippet - full width */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Code
        </Typography>
        <CodeBlock code={piece.codeSnippet} language="cpp" />
      </Box>

      {/* Explanation - full width */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Deep Explanation
        </Typography>
        <Box
          sx={{
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mt: 2,
              mb: 1,
              color: 'primary.main',
            },
            '& h4': {
              fontSize: '1.1rem',
              fontWeight: 600,
              mt: 2,
              mb: 1,
              color: 'text.primary',
            },
            '& p': {
              mb: 1.5,
              lineHeight: 1.8,
              color: 'text.secondary',
            },
            '& ul': {
              pl: 2,
              mb: 1.5,
            },
            '& li': {
              mb: 0.5,
              color: 'text.secondary',
            },
            '& strong': {
              color: 'text.primary',
              fontWeight: 600,
            },
            '& code': {
              bgcolor: 'action.hover',
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.9em',
            },
          }}
          dangerouslySetInnerHTML={{ __html: piece.explanation }}
        />
      </Box>

      {/* Key Concepts and Best Practices - side by side */}
      {(piece.concepts?.length > 0 || piece.practices?.length > 0) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          {/* Key Concepts */}
          {piece.concepts?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 280,
                p: 3,
                bgcolor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid',
                borderColor: 'rgba(56, 189, 248, 0.2)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon fontSize="small" />
                Key Concepts
              </Typography>
              <List dense disablePadding>
                {piece.concepts.map((concept, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={concept} primaryTypographyProps={{ fontSize: '0.95rem' }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Best Practices */}
          {piece.practices?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 280,
                p: 3,
                bgcolor: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid',
                borderColor: 'rgba(74, 222, 128, 0.2)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" />
                Best Practices
              </Typography>
              <List dense disablePadding>
                {piece.practices.map((practice, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={practice} primaryTypographyProps={{ fontSize: '0.95rem' }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
