import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { ContentItem } from '../../types/content';
import { TagChip } from '../content/TagChip';
import ArticleIcon from '@mui/icons-material/Article';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CollectionsIcon from '@mui/icons-material/Collections';

interface ContentCardProps {
  content: ContentItem;
}

const iconMap = {
  topic: <ArticleIcon />,
  'lego-piece': <ExtensionIcon />,
  diagram: <AccountTreeIcon />,
  collection: <CollectionsIcon />,
};

export const ContentCard = ({ content }: ContentCardProps) => {
  const navigate = useNavigate();

  const getContentPath = () => {
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
    <Card
      onClick={() => navigate(getContentPath())}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ mr: 1, color: 'primary.main' }}>
            {iconMap[content.type]}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {content.title}
            </Typography>
            <Chip
              label={content.type}
              size="small"
              sx={{
                textTransform: 'capitalize',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {content.summary}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {content.tags.slice(0, 4).map((tag) => (
            <TagChip key={tag} tag={tag} clickable={false} />
          ))}
          {content.tags.length > 4 && (
            <Chip label={`+${content.tags.length - 4}`} size="small" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
