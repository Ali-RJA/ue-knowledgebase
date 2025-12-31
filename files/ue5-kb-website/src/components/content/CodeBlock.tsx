import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ExtensionIcon from '@mui/icons-material/Extension';
import { Link } from 'react-router-dom';

interface LegoPieceRef {
  slug: string;
  label?: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  inline?: boolean;
  legoPieces?: LegoPieceRef[];
}

export const CodeBlock = ({ code, language, inline = false, legoPieces = [] }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [showTags, setShowTags] = useState(false);

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

  const hasMultiplePieces = legoPieces.length > 1;
  const displayPieces = hasMultiplePieces && !showTags ? legoPieces.slice(0, 1) : legoPieces;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.7 }}>
            {language || 'code'}
          </Typography>

          {/* Lego Piece Tags */}
          {legoPieces.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Show lego references">
                <IconButton
                  size="small"
                  onClick={() => setShowTags(!showTags)}
                  sx={{
                    p: 0.5,
                    opacity: showTags ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <ExtensionIcon fontSize="small" sx={{ color: 'primary.main' }} />
                </IconButton>
              </Tooltip>

              {/* Visible tags when toggled or single piece */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {displayPieces.map((piece, index) => (
                  <Tooltip key={piece.slug} title={`Learn: ${piece.label || piece.slug}`}>
                    <Chip
                      component={Link}
                      to={`/lego-piece/${piece.slug}`}
                      size="small"
                      label={piece.label || piece.slug}
                      icon={<ExtensionIcon sx={{ fontSize: '0.8rem !important' }} />}
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        opacity: showTags || !hasMultiplePieces ? 0.8 : 0.5,
                        transition: 'opacity 0.2s, transform 0.2s',
                        '&:hover': {
                          opacity: 1,
                          transform: 'scale(1.05)',
                        },
                        '& .MuiChip-icon': {
                          ml: 0.5,
                        },
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Show count indicator if hidden and multiple */}
                {hasMultiplePieces && !showTags && (
                  <Typography variant="caption" sx={{ opacity: 0.5, ml: 0.5 }}>
                    +{legoPieces.length - 1}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

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
