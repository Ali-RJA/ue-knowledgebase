import { Box } from '@mui/material';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  html: string;
}

export const HtmlContent = ({ html }: HtmlContentProps) => {
  const sanitized = DOMPurify.sanitize(html, {
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target'],
  });

  return (
    <Box
      sx={{
        '& h1': { fontSize: '2rem', fontWeight: 700, mt: 3, mb: 2 },
        '& h2': { fontSize: '1.75rem', fontWeight: 600, mt: 2.5, mb: 1.5 },
        '& h3': { fontSize: '1.5rem', fontWeight: 600, mt: 2, mb: 1.25 },
        '& p': { mb: 2, lineHeight: 1.7 },
        '& ul, & ol': { pl: 3, mb: 2 },
        '& li': { mb: 0.5 },
        '& code': {
          bgcolor: 'action.hover',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.875em',
        },
        '& pre': {
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          overflow: 'auto',
          my: 2,
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 1,
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          my: 2,
          '& th, & td': {
            p: 1.5,
            border: 1,
            borderColor: 'divider',
          },
          '& th': {
            bgcolor: 'action.hover',
            fontWeight: 600,
          },
        },
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};
