import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid2,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Code as CodeIcon,
  Notes as NotesIcon,
  AccountTree as DiagramIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import mermaid from 'mermaid';
import type { Category } from '../types/content';
import { tagColors, getTagColor } from '../data/tags';

// Block types
type BlockType = 'code' | 'notes' | 'mermaid';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  language?: string; // for code blocks
  title?: string; // for notes/mermaid blocks
}

interface CustomPageFormData {
  title: string;
  summary: string;
  tags: string[];
  category: Category;
  blocks: ContentBlock[];
}

const categories: Category[] = ['architecture', 'core-systems', 'control', 'design'];
const suggestedTags = Object.keys(tagColors);

const blockTypeLabels: Record<BlockType, string> = {
  code: 'Code Block',
  notes: 'Notes Block',
  mermaid: 'Mermaid Diagram',
};

const blockTypeIcons: Record<BlockType, React.ReactNode> = {
  code: <CodeIcon fontSize="small" />,
  notes: <NotesIcon fontSize="small" />,
  mermaid: <DiagramIcon fontSize="small" />,
};

// Database types (for Supabase integration)
interface CustomPageRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: Category;
  tags: string[];
  blocks: ContentBlock[];
  created_at: string;
}

export const CreateCustomPage = () => {
  const [formData, setFormData] = useState<CustomPageFormData>({
    title: '',
    summary: '',
    tags: [],
    category: 'core-systems',
    blocks: [],
  });

  const [previewMermaid, setPreviewMermaid] = useState<Record<string, string>>({});
  const [mermaidErrors, setMermaidErrors] = useState<Record<string, string>>({});
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [addBlockAnchor, setAddBlockAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1a1a2e',
        primaryTextColor: '#eee',
        primaryBorderColor: '#4a4a6a',
        lineColor: '#61dafb',
        secondaryColor: '#16213e',
        tertiaryColor: '#0f3460',
        noteBkgColor: '#ffd93d',
        noteTextColor: '#000',
        fontSize: '14px',
      },
    });
  }, []);

  // Generate markdown preview
  useEffect(() => {
    const generateMarkdown = () => {
      if (!formData.title.trim()) {
        setGeneratedMarkdown('');
        return;
      }

      let markdown = `# ${formData.title}

> ${formData.summary}

---

`;

      // Add blocks
      formData.blocks.forEach((block) => {
        if (block.type === 'mermaid') {
          markdown += `## ${block.title || 'Diagram'}\n\n\`\`\`mermaid\n${block.content}\n\`\`\`\n\n---\n\n`;
        } else if (block.type === 'code') {
          markdown += `## ${block.title || 'Code'}\n\n\`\`\`${block.language || ''}\n${block.content}\n\`\`\`\n\n---\n\n`;
        } else if (block.type === 'notes') {
          markdown += `## ${block.title || 'Notes'}\n\n\`\`\`text\n${block.content}\n\`\`\`\n\n---\n\n`;
        }
      });

      // Add tags
      if (formData.tags.length > 0) {
        markdown += `## Tags\n${formData.tags.map((tag) => `- ${tag}`).join('\n')}\n`;
      }

      setGeneratedMarkdown(markdown);
    };

    generateMarkdown();
  }, [formData.title, formData.summary, formData.blocks, formData.tags]);

  // Live mermaid preview for each block
  useEffect(() => {
    const previews: Record<string, string> = {};
    const errors: Record<string, string> = {};

    const renderAllDiagrams = async () => {
      for (const block of formData.blocks.filter((b) => b.type === 'mermaid')) {
        if (!block.content.trim()) {
          previews[block.id] = '';
          continue;
        }

        try {
          const trimmedChart = block.content.trim();
          const validStarters = [
            'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
            'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
            'gitGraph', 'mindmap', 'timeline', 'quadrantChart',
            'xychart', 'sankey', 'block'
          ];
          const hasValidStart = validStarters.some((starter) =>
            trimmedChart.toLowerCase().startsWith(starter.toLowerCase())
          );

          if (!hasValidStart) {
            throw new Error('Invalid mermaid diagram syntax');
          }

          const uniqueId = `preview-${block.id}-${Date.now()}`;
          const { svg } = await mermaid.render(uniqueId, trimmedChart);
          previews[block.id] = svg;
          errors[block.id] = '';
        } catch (err) {
          console.error('Mermaid preview error:', err);
          errors[block.id] = err instanceof Error ? err.message : 'Invalid mermaid syntax';
          previews[block.id] = '';
        }
      }

      setPreviewMermaid(previews);
      setMermaidErrors(errors);
    };

    const timeoutId = setTimeout(renderAllDiagrams, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.blocks]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      language: type === 'code' ? 'cpp' : undefined,
      title: type === 'mermaid' ? 'Diagram' : type === 'notes' ? 'Notes' : undefined,
    };
    setFormData({ ...formData, blocks: [...formData.blocks, newBlock] });
    setAddBlockAnchor(null);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    });
  };

  const removeBlock = (id: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.filter((block) => block.id !== id),
    });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...formData.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setFormData({ ...formData, blocks: newBlocks });
  };

  const downloadMarkdown = () => {
    const slug = generateSlug(formData.title) || `custom-page-${Date.now()}`;
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Database save functionality (skeleton)
  const handleSaveToDatabase = async () => {
    if (!formData.title.trim()) {
      setSaveMessage('Please enter a title');
      setSaveStatus('error');
      return;
    }

    setSaveDialogOpen(true);
    setSaveStatus('saving');
    setSaveMessage('');

    try {
      const slug = generateSlug(formData.title);
      const record: Partial<CustomPageRecord> = {
        title: formData.title,
        slug: slug || `custom-page-${Date.now()}`,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags,
        blocks: formData.blocks,
      };

      // TODO: Uncomment when Supabase is configured
      // import { supabase } from '../lib/supabase';
      // const { data, error } = await supabase
      //   .from('custom_pages')
      //   .upsert(record)
      //   .select();
      //
      // if (error) throw error;

      // Simulate save for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Would save to database:', JSON.stringify(record, null, 2));

      setSaveStatus('success');
      setSaveMessage('Page saved! (Database integration pending - see console for data)');
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Create Custom Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new page with dynamic content blocks. Add code, notes, or mermaid diagrams.
      </Typography>

      <Grid2 container spacing={4}>
        {/* Form Section */}
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {/* Metadata Section */}
            <Typography variant="h6" gutterBottom>
              Page Metadata
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                required
                placeholder="e.g., My Custom Architecture"
              />

              <TextField
                label="Summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description of the page content"
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as Category })
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                options={suggestedTags}
                value={formData.tags}
                onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option}
                        size="small"
                        sx={{
                          bgcolor: getTagColor(option),
                          color: '#fff',
                        }}
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags" />
                )}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Blocks Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6">Content Blocks</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setAddBlockAnchor(e.currentTarget)}
                startIcon={<AddIcon />}
              >
                Add Block
              </Button>
              <Menu
                anchorEl={addBlockAnchor}
                open={Boolean(addBlockAnchor)}
                onClose={() => setAddBlockAnchor(null)}
              >
                {(['code', 'notes', 'mermaid'] as BlockType[]).map((type) => (
                  <MenuItem key={type} onClick={() => addBlock(type)}>
                    <ListItemIcon>{blockTypeIcons[type]}</ListItemIcon>
                    <ListItemText>{blockTypeLabels[type]}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {formData.blocks.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No blocks added yet. Click "Add Block" to add content.
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {formData.blocks.map((block, index) => (
                <Card
                  key={block.id}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(97, 218, 251, 0.03)' }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <DragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
                      <Chip
                        icon={blockTypeIcons[block.type] as React.ReactElement}
                        label={blockTypeLabels[block.type]}
                        size="small"
                        color={
                          block.type === 'code'
                            ? 'primary'
                            : block.type === 'mermaid'
                            ? 'secondary'
                            : 'default'
                        }
                      />
                      <TextField
                        size="small"
                        label="Title"
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        sx={{ ml: 'auto', minWidth: 150 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                      >
                        <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === formData.blocks.length - 1}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeBlock(block.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {block.type === 'code' && (
                      <>
                        <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={block.language || 'cpp'}
                            label="Language"
                            onChange={(e) =>
                              updateBlock(block.id, { language: e.target.value })
                            }
                          >
                            <MenuItem value="cpp">C++</MenuItem>
                            <MenuItem value="csharp">C#</MenuItem>
                            <MenuItem value="typescript">TypeScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="text">Text</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          multiline
                          rows={8}
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Enter your code here..."
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'monospace',
                            },
                          }}
                        />
                      </>
                    )}

                    {block.type === 'notes' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Enter your notes here..."
                        helperText="Notes will be rendered as a text code block"
                      />
                    )}

                    {block.type === 'mermaid' && (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={8}
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="flowchart TD
    A[Start] --> B[Process]
    B --> C[End]"
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                            },
                          }}
                        />
                        {mermaidErrors[block.id] && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {mermaidErrors[block.id]}
                          </Alert>
                        )}
                      </Box>
                    )}
                  </CardContent>

                  {/* Mermaid Preview */}
                  {block.type === 'mermaid' && previewMermaid[block.id] && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Preview:
                      </Typography>
                      <Card
                        sx={{
                          bgcolor: '#0d1117',
                          border: 1,
                          borderColor: 'rgba(97, 218, 251, 0.3)',
                          p: 1,
                        }}
                      >
                        <Box
                          sx={{
                            '& svg': {
                              display: 'block',
                              maxWidth: '100%',
                              height: 'auto',
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: previewMermaid[block.id] }}
                        />
                      </Card>
                    </Box>
                  )}
                </Card>
              ))}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveToDatabase}
                startIcon={<SaveIcon />}
                disabled={!formData.title.trim()}
              >
                Save to Database
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={downloadMarkdown}
                startIcon={<DownloadIcon />}
                disabled={!formData.title.trim()}
              >
                Download Markdown
              </Button>
            </Box>
          </Paper>
        </Grid2>

        {/* Preview Section */}
        <Grid2 size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              position: 'sticky',
              top: 16,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Markdown Preview</Typography>
              <IconButton
                size="small"
                onClick={() => handleCopy(generatedMarkdown, 'preview')}
              >
                {copied.preview ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
              </IconButton>
            </Box>

            <Paper
              sx={{
                p: 2,
                bgcolor: '#0d1117',
                maxHeight: '70vh',
                overflow: 'auto',
                '& pre': { m: 0, fontSize: '0.8rem' },
              }}
            >
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {generatedMarkdown || 'Enter a title to see preview...'}
              </pre>
            </Paper>
          </Paper>
        </Grid2>
      </Grid2>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Custom Page</DialogTitle>
        <DialogContent>
          {saveStatus === 'saving' && <LinearProgress sx={{ mb: 2 }} />}
          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {saveMessage}
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveMessage}
            </Alert>
          )}
          {saveStatus === 'idle' && (
            <Typography>
              Ready to save "{formData.title || 'Untitled'}" to the database.
            </Typography>
          )}
          {saveStatus !== 'saving' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data to be saved:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#0d1117', maxHeight: 200, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                  {JSON.stringify(
                    {
                      title: formData.title,
                      slug: generateSlug(formData.title),
                      summary: formData.summary,
                      category: formData.category,
                      tags: formData.tags,
                      blocks: formData.blocks,
                    },
                    null,
                    2
                  )}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            {saveStatus === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {saveStatus === 'idle' && (
            <Button
              variant="contained"
              onClick={handleSaveToDatabase}
              disabled={!formData.title.trim()}
            >
              Confirm Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
