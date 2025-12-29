import { Box, Container, Typography, Grid2, Button } from \'@mui/material\';@
import { useNavigate } from 'react-router-dom';@
import { ContentCard } from '../components/features/ContentCard';@
import { topics, diagrams, collections } from '../data/content-index';@
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';@
@
export const HomePage = () => {@
  const navigate = useNavigate();@
@
  const featuredTopics = topics.slice(0, 3);@
  const featuredDiagrams = diagrams.slice(0, 3);@
@
  return (@
    <Box>@
      {/* Hero Section */}@
      <Box@
        sx={{@
          background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',@
          borderBottom: 1,@
          borderColor: 'divider',@
          py: 8,@
        }}@
      >@
        <Container maxWidth="lg">@
          <Typography@
            variant="h2"@
            component="h1"@
            align="center"@
            gutterBottom@
            sx={{@
              fontWeight: 800,@
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',@
              WebkitBackgroundClip: 'text',@
              WebkitTextFillColor: 'transparent',@
              mb: 2,@
            }}@
          >@
            Unreal Engine 5 Knowledge Base@
          </Typography>@
          <Typography@
            variant="h5"@
            align="center"@
            color="text.secondary"@
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}@
          >@
            Complete architectural reference for building a Ghost of Tsushima-style melee combat game@
          </Typography>@
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>@
            <Button@
              variant="contained"@
              size="large"@
              endIcon={<ArrowForwardIcon />}@
              onClick={() => navigate('/topics')}@
            >@
              Explore Topics@
            </Button>@
            <Button@
              variant="outlined"@
              size="large"@
              onClick={() => navigate('/lego-pieces')}@
            >@
              Browse Lego Pieces@
            </Button>@
          </Box>@
        </Container>@
      </Box>@
@
      <Container maxWidth="lg" sx={{ py: 6 }}>@
        {/* Featured Topics */}@
        <Box sx={{ mb: 6 }}>@
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>@
            <Typography variant="h4" component="h2" fontWeight={700}>@
              Featured Topics@
            </Typography>@
            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/topics')}>@
              View All@
            </Button>@
          </Box>@
          <Grid2 container spacing={3}>@
            {featuredTopics.map((topic) => (@
              <Grid2 xs={12} md={4} key={topic.id}>@
                <ContentCard content={topic} />@
              </Grid2>@
            ))}@
          </Grid2>@
        </Box>@
@
        {/* Featured Diagrams */}@
        <Box sx={{ mb: 6 }}>@
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>@
            <Typography variant="h4" component="h2" fontWeight={700}>@
              Featured Diagrams@
            </Typography>@
            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/diagrams')}>@
              View All@
            </Button>@
          </Box>@
          <Grid2 container spacing={3}>@
            {featuredDiagrams.map((diagram) => (@
              <Grid2 xs={12} md={4} key={diagram.id}>@
                <ContentCard content={diagram} />@
              </Grid2>@
            ))}@
          </Grid2>@
        </Box>@
@
        {/* Collections */}@
        <Box>@
          <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>@
            Special Collections@
          </Typography>@
          <Grid2 container spacing={3}>@
            {collections.map((collection) => (@
              <Grid2 xs={12} md={6} key={collection.id}>@
                <ContentCard content={collection} />@
              </Grid2>@
            ))}@
          </Grid2>@
        </Box>@
      </Container>@
    </Box>@
  );@
};@
