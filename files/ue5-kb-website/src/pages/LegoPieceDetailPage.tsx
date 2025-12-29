import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Explanation
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
          {piece.explanation}
        </Typography>
      </Box>
    </Box>
  );
};
