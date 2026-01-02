import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, Navigate } from 'react-router-dom';
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
import type { Collection } from '../types/content';
import { HtmlContent } from '../components/content/HtmlContent';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const CollectionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Redirect cpp-lego-pieces to the main lego pieces page
  if (slug === 'cpp-lego-pieces') {
    return <Navigate to="/lego-pieces" replace />;
  }

  useEffect(() => {
    const loadCollection = async () => {
      if (!slug) return;

      const foundCollection = getContentBySlug(slug) as Collection;
      if (foundCollection && foundCollection.type === 'collection') {
        setCollection(foundCollection);

        // Load HTML content
        try {
          const response = await fetch(`/content/${foundCollection.sourcePath}`);
          if (response.ok) {
            const text = await response.text();
            setHtmlContent(text);
          }
        } catch (error) {
          console.error('Error loading collection:', error);
          setHtmlContent('<p>Content not available</p>');
        }
      }
      setLoading(false);
    };

    loadCollection();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!collection) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Collection not found</Typography>
      </Box>
    );
  }

  const relatedItems = getRelatedContent(collection);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/collections" color="inherit">
          Collections
        </Link>
        <Typography color="text.primary">{collection.title}</Typography>
      </Breadcrumbs>

      {/* Header section with title, tags, and related content inline */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {collection.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="collection" size="small" variant="outlined" />
            </Box>
          </Box>
          {relatedItems.length > 0 && (
            <Box sx={{ flexShrink: 0 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {collection.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {collection.summary}
        </Typography>
      </Box>

      {/* Full-width content */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, width: '100%' }}>
        <HtmlContent html={htmlContent} />
      </Box>
    </Box>
  );
};

