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
import type { Collection } from '../types/content';
import { HtmlContent } from '../components/content/HtmlContent';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const CollectionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Collection not found</Typography>
      </Container>
    );
  }

  const relatedItems = getRelatedContent(collection);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/collections" color="inherit">
          Collections
        </Link>
        <Typography color="text.primary">{collection.title}</Typography>
      </Breadcrumbs>

      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, lg: relatedItems.length > 0 ? 8 : 12 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {collection.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label="collection" size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {collection.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {collection.summary}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
            <HtmlContent html={htmlContent} />
          </Box>
        </Grid2>

        {relatedItems.length > 0 && (
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          </Grid2>
        )}
      </Grid2>
    </Container>
  );
};
