import { Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTagColor } from '../../data/tags';

interface TagChipProps {
  tag: string;
  size?: 'small' | 'medium';
  clickable?: boolean;
}

export const TagChip = ({ tag, size = 'small', clickable = true }: TagChipProps) => {
  const navigate = useNavigate();
  const color = getTagColor(tag);

  const handleClick = () => {
    if (clickable) {
      navigate(`/search?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <Chip
      label={tag}
      size={size}
      onClick={clickable ? handleClick : undefined}
      clickable={clickable}
      sx={{
        bgcolor: `${color}22`,
        color: color,
        borderColor: color,
        border: '1px solid',
        fontWeight: 500,
        '&:hover': clickable ? {
          bgcolor: `${color}33`,
        } : {},
      }}
    />
  );
};
