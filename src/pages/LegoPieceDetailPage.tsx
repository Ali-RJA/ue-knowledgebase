import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { getRelatedContent, legoPieces } from '../data/content-index';
import type { LegoPiece } from '../types/content';
import { CodeBlock } from '../components/content/CodeBlock';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { TagChip } from '../components/content/TagChip';
import { RelatedContent } from '../components/features/RelatedContent';

export const LegoPieceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const piece = legoPieces.find(p => p.slug === slug) as LegoPiece | undefined;

  if (!piece) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Typography variant="h4">Lego piece not found</Typography>
      </Box>
    );
  }

  const relatedItems = getRelatedContent(piece);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/lego-pieces" color="inherit">
          Lego Pieces
        </Link>
        <Typography color="text.primary">{piece.title}</Typography>
      </Breadcrumbs>

      {/* Header section with title, tags, and related content inline */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {piece.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={piece.pieceType} size="small" color="primary" />
              <Chip label="lego-piece" size="small" variant="outlined" />
            </Box>
          </Box>
          {relatedItems.length > 0 && (
            <Box sx={{ flexShrink: 0 }}>
              <RelatedContent items={relatedItems} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {piece.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {piece.summary}
        </Typography>
      </Box>

      {/* Diagram - full width */}
      {piece.diagram && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" component="h2" fontWeight={600}>
              Flow Diagram
            </Typography>
          </Box>
          <MermaidDiagram chart={piece.diagram} id={`${piece.id}-diagram`} />
        </Paper>
      )}

      {/* Code Snippet - full width */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.02),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'warning.main',
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.warning.main, 0.15)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeIcon sx={{ color: 'warning.main', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Code
          </Typography>
        </Box>
        <CodeBlock code={piece.codeSnippet} language="cpp" />
      </Paper>

      {/* Explanation - full width */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.02),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'info.main',
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.info.main, 0.15)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MenuBookIcon sx={{ color: 'info.main', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Deep Explanation
          </Typography>
        </Box>
        <Box
          sx={{
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mt: 3,
              mb: 1.5,
              color: 'primary.main',
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              pl: 2,
            },
            '& h4': {
              fontSize: '1.1rem',
              fontWeight: 600,
              mt: 2.5,
              mb: 1,
              color: 'text.primary',
            },
            '& p': {
              mb: 2,
              lineHeight: 1.8,
              color: 'text.secondary',
            },
            '& ul': {
              pl: 2,
              mb: 2,
            },
            '& li': {
              mb: 0.75,
              color: 'text.secondary',
              lineHeight: 1.7,
            },
            '& strong': {
              color: 'text.primary',
              fontWeight: 600,
            },
            '& code': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875em',
              fontWeight: 500,
            },
          }}
          dangerouslySetInnerHTML={{ __html: piece.explanation }}
        />
      </Paper>

      {/* Key Concepts and Best Practices - side by side */}
      {(piece.concepts?.length > 0 || piece.practices?.length > 0) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          {/* Key Concepts */}
          {piece.concepts?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 280,
                p: 0,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'rgba(56, 189, 248, 0.2)',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <LightbulbIcon fontSize="small" />
                  Key Concepts
                </Typography>
              </Box>
              <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) }}>
                <List dense disablePadding>
                  {piece.concepts.map((concept, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 1.5,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={concept}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          )}

          {/* Best Practices */}
          {piece.practices?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 280,
                p: 0,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'rgba(74, 222, 128, 0.3)',
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'success.main',
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.success.main, 0.2)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'rgba(74, 222, 128, 0.2)',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <CheckCircleIcon fontSize="small" />
                  Best Practices
                </Typography>
              </Box>
              <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.success.main, 0.02) }}>
                <List dense disablePadding>
                  {piece.practices.map((practice, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 1.5,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            color: 'success.main',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={practice}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
