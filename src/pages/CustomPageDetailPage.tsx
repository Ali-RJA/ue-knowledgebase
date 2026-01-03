import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  alpha,
  Button,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableChartIcon from '@mui/icons-material/TableChart';
import type { CustomPage, ContentBlock } from '../types/content';
import { CodeBlock } from '../components/content/CodeBlock';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { MarkdownRenderer } from '../components/content/MarkdownRenderer';
import { TableBlock } from '../components/content/TableBlock';
import { TagChip } from '../components/content/TagChip';

export const CustomPageDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/custom-pages/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found');
          } else {
            throw new Error('Failed to fetch page');
          }
          return;
        }
        const data = await response.json();
        setPage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'code': return <CodeIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'notes': return <NotesIcon sx={{ color: 'info.main', fontSize: 20 }} />;
      case 'mermaid': return <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
      case 'table': return <TableChartIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      default: return null;
    }
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'code': return 'warning';
      case 'notes': return 'info';
      case 'mermaid': return 'primary';
      case 'table': return 'success';
      default: return 'primary';
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const colorKey = getBlockColor(block.type) as 'warning' | 'info' | 'primary' | 'success';

    return (
      <Paper
        key={block.id}
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette[colorKey].main, 0.02),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: `${colorKey}.main`,
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette[colorKey].main, 0.15)}`,
          },
        }}
      >
        {block.title && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette[colorKey].main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getBlockIcon(block.type)}
            </Box>
            <Typography variant="h5" component="h2" fontWeight={600}>
              {block.title}
            </Typography>
          </Box>
        )}

        {block.type === 'code' && (
          <CodeBlock code={block.content} language={block.language || 'cpp'} />
        )}

        {block.type === 'notes' && (
          <MarkdownRenderer content={block.content} />
        )}

        {block.type === 'mermaid' && (
          <MermaidDiagram chart={block.content} id={`diagram-${block.id}`} />
        )}

        {block.type === 'table' && (
          <TableBlock content={block.content} title={block.title} />
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!page) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Page not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Typography color="text.primary">{page.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Typography variant="h3" component="h1" fontWeight={700}>
            {page.title}
          </Typography>
          <Button
            component={RouterLink}
            to={`/custom/${page.slug}/edit`}
            variant="outlined"
            startIcon={<EditIcon />}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label={page.category}
            size="small"
            color="primary"
          />
          <Chip label="custom-page" size="small" variant="outlined" />
          {!page.published && (
            <Chip label="Draft" size="small" color="warning" />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {page.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>

        {page.summary && (
          <Typography variant="body1" color="text.secondary">
            {page.summary}
          </Typography>
        )}
      </Box>

      {/* Content Blocks */}
      {page.blocks.map(renderBlock)}
    </Box>
  );
};
