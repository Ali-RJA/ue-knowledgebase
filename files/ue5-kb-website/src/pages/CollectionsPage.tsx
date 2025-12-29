import { Container, Typography, Grid2 } from '@mui/material';
import { ContentCard } from '../components/features/ContentCard';
import { collections } from '../data/content-index';

export const CollectionsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Collections
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive collections of UE5 knowledge, architecture, and code libraries.
      </Typography>

      <Grid2 container spacing={3}>
        {collections.map((collection) => (
          <Grid2 size={{ xs: 12, md: 6 }} key={collection.id}>
            <ContentCard content={collection} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};
