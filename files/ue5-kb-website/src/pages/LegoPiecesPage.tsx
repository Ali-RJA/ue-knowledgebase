import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  InputBase,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ContentCard } from '../components/features/ContentCard';
import { legoPieces } from '../data/content-index';

// Get unique piece types with counts
const pieceTypeData = (() => {
  const counts: Record<string, number> = { All: legoPieces.length };
  legoPieces.forEach(p => {
    counts[p.pieceType] = (counts[p.pieceType] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
})();

export const LegoPiecesPage = () => {
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPieces = useMemo(() => {
    let pieces = selectedType === 'All'
      ? legoPieces
      : legoPieces.filter(p => p.pieceType === selectedType);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pieces = pieces.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.codeSnippet.toLowerCase().includes(query)
      );
    }
    
    return pieces;
  }, [selectedType, searchQuery]);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight={800}
            sx={{
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🧱 C++ Lego Pieces
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {legoPieces.length} reusable C++ code snippets and patterns for Unreal Engine 5 development.
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            px: 2,
            py: 1,
            maxWidth: 500,
            mb: 3,
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.2)',
            },
          }}
        >
          <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />
          <InputBase
            placeholder="Search snippets (e.g. 'overlap', 'timer', 'delegate')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        {/* Category Filter Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {pieceTypeData.map(({ type, count }) => (
            <Chip
              key={type}
              label={`${type} (${count})`}
              onClick={() => setSelectedType(type)}
              variant={selectedType === type ? 'filled' : 'outlined'}
              color={selectedType === type ? 'primary' : 'default'}
              sx={{
                fontWeight: selectedType === type ? 600 : 400,
                '&:hover': {
                  bgcolor: selectedType === type ? 'primary.dark' : 'action.hover',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredPieces.length} piece{filteredPieces.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </Typography>

      {/* Grid of pieces */}
      <Grid container spacing={3}>
        {filteredPieces.map((piece) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={piece.id}>
            <ContentCard content={piece} />
          </Grid>
        ))}
      </Grid>

      {filteredPieces.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No pieces found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
