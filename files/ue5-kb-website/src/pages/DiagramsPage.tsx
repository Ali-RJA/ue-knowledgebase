import { Box, Container, Typography, Grid2 } from '@mui/material';
import { ContentCard } from '../components/features/ContentCard';
import { diagrams } from '../data/content-index';

export const DiagramsPage = () => {
  // Group diagrams by category
  const groupedDiagrams = diagrams.reduce((acc, diagram) => {
    const category = diagram.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(diagram);
    return acc;
  }, {} as Record<string, typeof diagrams>);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Diagrams
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Visual representations of UE5 systems, flows, and architectures.
      </Typography>

      {Object.entries(groupedDiagrams).map(([category, items]) => (
        <Box key={category} sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Typography>
          <Grid2 container spacing={3}>
            {items.map((diagram) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={diagram.id}>
                <ContentCard content={diagram} />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      ))}
    </Container>
  );
};
