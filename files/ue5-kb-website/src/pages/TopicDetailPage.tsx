import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getContentBySlug, getRelatedContent } from '../data/content-index';
import type { Topic } from '../types/content';
import { MarkdownRenderer } from '../components/content/MarkdownRenderer';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const TopicDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopic = async () => {
      if (!slug) return;

      const foundTopic = getContentBySlug(slug) as Topic;
      if (foundTopic && foundTopic.type === 'topic') {
        setTopic(foundTopic);

        // Load markdown content from public folder
        try {
          const response = await fetch(`/content/${foundTopic.sourcePath}`);
          if (response.ok) {
            const text = await response.text();
            setContent(text);
          }
        } catch (error) {
          console.error('Error loading content:', error);
          setContent('# Content not available\n\nThe content for this topic could not be loaded.');
        }
      }
      setLoading(false);
    };

    loadTopic();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Topic not found</Typography>
      </Container>
    );
  }

  const relatedItems = getRelatedContent(topic);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/topics" color="inherit">
          Topics
        </Link>
        <Link component={RouterLink} to={`/topics/${topic.category}`} color="inherit">
          {topic.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Link>
        <Typography color="text.primary">{topic.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {topic.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={topic.category} size="small" color="primary" />
              <Chip label={topic.type} size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {topic.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {topic.summary}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
            <MarkdownRenderer content={content} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <RelatedContent items={relatedItems} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

