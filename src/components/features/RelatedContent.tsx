import { Box, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { ContentItem } from '../../types/content';

interface RelatedContentProps {
  items: ContentItem[];
}

export const RelatedContent = ({ items }: RelatedContentProps) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const getContentPath = (content: ContentItem) => {
    switch (content.type) {
      case 'topic':
        return `/topic/${content.slug}`;
      case 'lego-piece':
        return `/lego-piece/${content.slug}`;
      case 'diagram':
        return `/diagram/${content.slug}`;
      case 'collection':
        return `/collection/${content.slug}`;
      default:
        return '/';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.7, mr: 1 }}>
        Related:
      </Typography>
      {items.slice(0, 5).map((item) => (
        <Chip
          key={item.id}
          label={item.title}
          size="small"
          clickable
          onClick={() => navigate(getContentPath(item))}
          sx={{
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        />
      ))}
    </Box>
  );
};
