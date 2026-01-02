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
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Topic not found</Typography>
      </Box>
    );
  }

  const relatedItems = getRelatedContent(topic);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
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

      {/* Header section with title, tags, and related content inline */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {topic.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={topic.category} size="small" color="primary" />
              <Chip label={topic.type} size="small" variant="outlined" />
            </Box>
          </Box>
          {relatedItems.length > 0 && (
            <Box sx={{ flexShrink: 0 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {topic.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {topic.summary}
        </Typography>
      </Box>

      {/* Full-width content */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
        <MarkdownRenderer content={content} />
      </Box>
    </Box>
  );
};

