import { useState } from 'react';
import { Box, Container, Typography, Grid, Tabs, Tab, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ContentCard } from '../components/features/ContentCard';
import { legoPieces } from '../data/content-index';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Get unique piece types
const pieceTypes = ['All', ...Array.from(new Set(legoPieces.map(p => p.pieceType)))];

export const LegoPiecesPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('All');

  const filteredPieces = selectedType === 'All'
    ? legoPieces
    : legoPieces.filter(p => p.pieceType === selectedType);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Lego Pieces
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Reusable C++ code snippets and patterns for Unreal Engine development.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/collection/cpp-lego-pieces')}
        >
          Full Library (100+)
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedType}
          onChange={(_, newValue) => setSelectedType(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {pieceTypes.map((type) => (
            <Tab key={type} label={type} value={type} />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredPieces.map((piece) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={piece.id}>
            <ContentCard content={piece} />
          </Grid>
        ))}
      </Grid>

      {filteredPieces.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No pieces found in this category
          </Typography>
        </Box>
      )}
    </Container>
  );
};
