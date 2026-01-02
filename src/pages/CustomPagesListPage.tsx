import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ContentCard } from '../components/features/ContentCard';
import AddIcon from '@mui/icons-material/Add';
import type { CustomPage } from '../types/content';

export const CustomPagesListPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/custom-pages');
        if (!response.ok) {
          throw new Error('Failed to fetch custom pages');
        }
        const data = await response.json();
        setPages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Custom Pages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            User-created pages with custom diagrams, code snippets, and notes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create')}
        >
          Create Page
        </Button>
      </Box>

      {pages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No custom pages yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first custom page to get started!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
          >
            Create Page
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {pages.map((page) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={page.id}>
              <ContentCard content={page} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
