import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Fuse from 'fuse.js';
import { ContentCard } from '../components/features/ContentCard';
import { allContent } from '../data/content-index';
import type { ContentItem } from '../types/content';

const fuse = new Fuse(allContent, {
  keys: ['title', 'summary', 'tags'],
  threshold: 0.3,
  includeScore: true,
});

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [results, setResults] = useState<ContentItem[]>([]);

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    const searchTag = searchParams.get('tag') || '';

    setQuery(searchQuery);
    setTag(searchTag);

    if (searchTag) {
      // Filter by tag
      const tagResults = allContent.filter(item =>
        item.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase()))
      );
      setResults(tagResults);
    } else if (searchQuery) {
      // Fuzzy search
      const searchResults = fuse.search(searchQuery);
      setResults(searchResults.map(result => result.item));
    } else {
      setResults([]);
    }
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Search
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search topics, tags, content..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {tag && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Showing results for tag: <strong>{tag}</strong>
          </Typography>
        </Box>
      )}

      {(query || tag) && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </Typography>
      )}

      <Grid container spacing={3}>
        {results.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <ContentCard content={item} />
          </Grid>
        ))}
      </Grid>

      {(query || tag) && results.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No results found
          </Typography>
        </Box>
      )}

      {!query && !tag && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Enter a search query or click on a tag to get started
          </Typography>
        </Box>
      )}
    </Container>
  );
};

