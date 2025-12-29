import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { ContentItem } from '../../types/content';
import { TagChip } from '../content/TagChip';

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
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Related Content
      </Typography>
      <List disablePadding>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(getContentPath(item))}
              sx={{
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <ListItemText
                primary={item.title}
                secondary={
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <TagChip key={tag} tag={tag} size="small" clickable={false} />
                    ))}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
