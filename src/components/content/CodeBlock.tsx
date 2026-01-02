import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CodeBlockProps {
  code: string;
  language?: string;
  inline?: boolean;
}

export const CodeBlock = ({ code, language, inline = false }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <Box
        component="code"
        sx={{
          bgcolor: 'action.hover',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.875em',
        }}
      >
        {code}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        my: 2,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.7 }}>
          {language || 'code'}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          lineHeight: 1.6,
        }}
      >
        <code>{code}</code>
      </Box>
    </Box>
  );
};
