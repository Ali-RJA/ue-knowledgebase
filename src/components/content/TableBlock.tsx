import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface TableBlockProps {
  content: string;
  title?: string;
}

// Parse CSV with support for quoted values and escaped quotes
const parseCSV = (csv: string): string[][] => {
  const rows: string[][] = [];
  const lines = csv.trim().split('\n');

  for (const line of lines) {
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          // Check for escaped quote
          if (i + 1 < line.length && line[i + 1] === '"') {
            currentCell += '"';
            i += 2;
            continue;
          } else {
            // End of quoted section
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          currentCell += char;
          i++;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
          i++;
        } else if (char === ',') {
          cells.push(currentCell.trim());
          currentCell = '';
          i++;
        } else {
          currentCell += char;
          i++;
        }
      }
    }

    cells.push(currentCell.trim());
    rows.push(cells);
  }

  return rows;
};

// Render cell content with inline code support (backticks)
const renderCellContent = (content: string) => {
  const parts = content.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <Box
          key={index}
          component="code"
          sx={{
            bgcolor: 'rgba(56, 189, 248, 0.15)',
            color: 'primary.light',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.8rem',
            fontFamily: 'monospace',
          }}
        >
          {code}
        </Box>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const TableBlock = ({ content, title }: TableBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows = parseCSV(content);
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" fontStyle="italic">
        No table content
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        my: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header bar */}
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
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {title || 'table'} • {dataRows.length} rows
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy CSV'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Table container */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            '& thead': {
              bgcolor: 'rgba(76, 175, 80, 0.08)',
            },
            '& th': {
              p: 1.5,
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'success.light',
              borderBottom: 2,
              borderColor: 'success.main',
              whiteSpace: 'nowrap',
            },
            '& td': {
              p: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              fontSize: '0.875rem',
              verticalAlign: 'top',
              lineHeight: 1.6,
            },
            '& tbody tr': {
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&:nth-of-type(even)': {
                bgcolor: 'rgba(255, 255, 255, 0.02)',
              },
            },
            '& tbody tr:last-of-type td': {
              borderBottom: 'none',
            },
          }}
        >
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{renderCellContent(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{renderCellContent(cell)}</td>
                ))}
                {/* Fill empty cells if row is shorter than headers */}
                {row.length < headers.length &&
                  Array(headers.length - row.length)
                    .fill(null)
                    .map((_, i) => <td key={`empty-${i}`} />)}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
};
