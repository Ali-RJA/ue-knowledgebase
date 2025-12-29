import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid2,
} from '@mui/material';
import { ContentCard } from '../components/features/ContentCard';
import { getContentByCategory } from '../data/content-index';
import type { Category } from '../types/content';

const categories: { value: Category; label: string }[] = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'core-systems', label: 'Core Systems' },
  { value: 'control', label: 'Control Systems' },
  { value: 'design', label: 'Design Patterns' },
];

export const TopicsListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('architecture');

  const topics = getContentByCategory(selectedCategory);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Topics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive guides covering UE5 architecture, systems, and design patterns.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat.value} label={cat.label} value={cat.value} />
          ))}
        </Tabs>
      </Box>

      <Grid2 container spacing={3}>
        {topics.map((topic) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
            <ContentCard content={topic} />
          </Grid2>
        ))}
      </Grid2>

      {topics.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No topics found in this category
          </Typography>
        </Box>
      )}
    </Container>
  );
};
