import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Collapse,
  Grid,
  alpha,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import mermaid from 'mermaid';
import type { Category, ContentBlock, BlockType, CodeLanguage, CustomPageInput } from '../types/content';
import { allTags } from '../data/tags';
import { CodeBlock } from '../components/content/CodeBlock';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { MarkdownRenderer } from '../components/content/MarkdownRenderer';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

const SUPPORTED_LANGUAGES: CodeLanguage[] = [
  'cpp', 'csharp', 'blueprint', 'html', 'css',
  'javascript', 'typescript', 'json', 'python', 'sql', 'bash', 'shell'
];

const BLOCK_TYPES: { value: BlockType; label: string; icon: React.ReactNode }[] = [
  { value: 'code', label: 'Code', icon: <CodeIcon fontSize="small" /> },
  { value: 'notes', label: 'Notes', icon: <NotesIcon fontSize="small" /> },
  { value: 'mermaid', label: 'Mermaid Diagram', icon: <AccountTreeIcon fontSize="small" /> },
];

const CATEGORIES: Category[] = ['architecture', 'core-systems', 'control', 'design', 'custom'];

const JSON_TEMPLATE = `{
  "title": "Page Title",
  "slug": "url-friendly-slug",
  "summary": "Brief description for cards and SEO",
  "category": "custom",
  "tags": ["tag1", "tag2"],
  "blocks": [
    {
      "id": "block-1",
      "type": "notes",
      "content": "# Introduction\\n\\nThis is a notes block with markdown support.",
      "title": "Introduction"
    },
    {
      "id": "block-2",
      "type": "code",
      "content": "// Your code here\\nvoid MyFunction() {\\n    // Implementation\\n}",
      "language": "cpp",
      "title": "Example Code"
    },
    {
      "id": "block-3",
      "type": "mermaid",
      "content": "flowchart TD\\n    A[Start] --> B[Process]\\n    B --> C[End]",
      "title": "Flow Diagram"
    }
  ],
  "published": true
}`;

const JSON_DOCUMENTATION = `
Block Types:
- code: Syntax highlighted code blocks
- notes: Documentation text (supports markdown)
- mermaid: Diagram definitions

Supported Languages for code blocks:
cpp, csharp, blueprint, html, css, javascript, typescript, json, python, sql, bash, shell

Best Practices:
1. Use descriptive titles that explain the concept
2. Add code blocks with appropriate language tags
3. Include diagrams for complex workflows
4. Structure content in logical sections
5. Add summary for SEO and card previews
6. Use consistent slug naming (kebab-case)
`;

interface BlockState extends ContentBlock {
  expanded: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const CreateCustomPage = () => {
  // Input mode state
  const [inputMode, setInputMode] = useState<number>(0); // 0 = Manual, 1 = JSON
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<Category>('custom');
  const [tags, setTags] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<BlockState[]>([]);
  const [published, setPublished] = useState(true);

  // UI state
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, slug]);

  const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addBlock = (type: BlockType) => {
    const newBlock: BlockState = {
      id: generateBlockId(),
      type,
      content: '',
      language: type === 'code' ? 'cpp' : undefined,
      title: '',
      expanded: true,
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<BlockState>) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(JSON_TEMPLATE);
      setCopied(true);
      setSnackbar({
        open: true,
        message: 'JSON template copied to clipboard!',
        severity: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to copy template',
        severity: 'error',
      });
    }
  };

  const validateJson = useCallback((jsonString: string): CustomPageInput | null => {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate required fields
      const requiredFields = ['title', 'slug', 'blocks'];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      if (missingFields.length > 0) {
        setJsonError(`Missing required fields: ${missingFields.join(', ')}`);
        return null;
      }

      // Validate blocks structure
      if (!Array.isArray(parsed.blocks)) {
        setJsonError('blocks must be an array');
        return null;
      }

      for (let i = 0; i < parsed.blocks.length; i++) {
        const block = parsed.blocks[i];
        if (!block.id || !block.type || block.content === undefined) {
          setJsonError(`Block ${i + 1} is missing required fields (id, type, content)`);
          return null;
        }
        if (!['code', 'notes', 'mermaid'].includes(block.type)) {
          setJsonError(`Block ${i + 1} has invalid type: ${block.type}`);
          return null;
        }
      }

      setJsonError(null);
      return parsed as CustomPageInput;
    } catch (e) {
      setJsonError(`Invalid JSON syntax: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    }
  }, []);

  const handleImportJson = () => {
    const parsed = validateJson(jsonInput);
    if (!parsed) return;

    // Populate form fields
    setTitle(parsed.title);
    setSlug(parsed.slug);
    setSummary(parsed.summary || '');
    setCategory(parsed.category || 'custom');
    setTags(parsed.tags || []);
    setPublished(parsed.published !== false);
    setBlocks(parsed.blocks.map(block => ({ ...block, expanded: true })));

    // Switch to manual mode
    setInputMode(0);
    setSnackbar({
      open: true,
      message: 'JSON imported successfully! You can now edit in Manual mode.',
      severity: 'success',
    });
  };

  const handleSave = async () => {
    // Validate form
    if (!title.trim()) {
      setSnackbar({ open: true, message: 'Title is required', severity: 'error' });
      return;
    }
    if (!slug.trim()) {
      setSnackbar({ open: true, message: 'Slug is required', severity: 'error' });
      return;
    }
    if (blocks.length === 0) {
      setSnackbar({ open: true, message: 'At least one block is required', severity: 'error' });
      return;
    }

    const pageData: CustomPageInput = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      category,
      tags,
      blocks: blocks.map(({ expanded, ...block }) => block),
      published,
    };

    try {
      const response = await fetch('/api/custom-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save page');
      }

      setSnackbar({
        open: true,
        message: 'Page saved successfully!',
        severity: 'success',
      });

      // Reset form
      setTitle('');
      setSlug('');
      setSummary('');
      setCategory('custom');
      setTags([]);
      setBlocks([]);
      setPublished(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save page',
        severity: 'error',
      });
    }
  };

  const exportAsJson = () => {
    const pageData: CustomPageInput = {
      title,
      slug,
      summary,
      category,
      tags,
      blocks: blocks.map(({ expanded, ...block }) => block),
      published,
    };
    const json = JSON.stringify(pageData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'custom-page'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'code': return <CodeIcon sx={{ color: 'warning.main' }} />;
      case 'notes': return <NotesIcon sx={{ color: 'info.main' }} />;
      case 'mermaid': return <AccountTreeIcon sx={{ color: 'primary.main' }} />;
    }
  };

  const renderBlockContent = (block: BlockState) => {
    switch (block.type) {
      case 'code':
        return block.content ? (
          <CodeBlock code={block.content} language={block.language || 'cpp'} />
        ) : (
          <Typography color="text.secondary" fontStyle="italic">No code content</Typography>
        );
      case 'notes':
        return block.content ? (
          <MarkdownRenderer content={block.content} />
        ) : (
          <Typography color="text.secondary" fontStyle="italic">No notes content</Typography>
        );
      case 'mermaid':
        return block.content ? (
          <MermaidDiagram chart={block.content} id={`preview-${block.id}`} />
        ) : (
          <Typography color="text.secondary" fontStyle="italic">No diagram content</Typography>
        );
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1600, mx: 'auto' }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Create Custom Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new knowledge base page with code blocks, notes, and diagrams.
      </Typography>

      {/* Input Mode Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={inputMode}
          onChange={(_, newValue) => setInputMode(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Manual Input" />
          <Tab label="JSON Input" />
        </Tabs>
      </Paper>

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid size={{ xs: 12, lg: showPreview ? 7 : 12 }}>
          {/* Manual Input Mode */}
          <TabPanel value={inputMode} index={0}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Page Details
              </Typography>

              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Slug (URL path)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                sx={{ mb: 2 }}
                required
                helperText="URL-friendly identifier (e.g., my-custom-page)"
              />

              <TextField
                fullWidth
                label="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 2 }}
                helperText="Brief description for cards and SEO"
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                freeSolo
                options={allTags.map(t => t.name)}
                value={tags}
                onChange={(_, newValue) => setTags(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      size="small"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags..." />
                )}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                }
                label="Published"
              />
            </Paper>

            {/* Content Blocks */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Content Blocks
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {BLOCK_TYPES.map(({ value, label, icon }) => (
                    <Button
                      key={value}
                      variant="outlined"
                      size="small"
                      startIcon={icon}
                      onClick={() => addBlock(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </Box>

              {blocks.length === 0 ? (
                <Alert severity="info">
                  No blocks yet. Add code, notes, or diagram blocks to build your page.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {blocks.map((block, index) => (
                    <Card
                      key={block.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
                          {getBlockIcon(block.type)}
                          <Typography variant="subtitle2" sx={{ flex: 1 }}>
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                            {block.title && ` - ${block.title}`}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, 'up')}
                            disabled={index === 0}
                          >
                            <ExpandLessIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, 'down')}
                            disabled={index === blocks.length - 1}
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => updateBlock(block.id, { expanded: !block.expanded })}
                          >
                            {block.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteBlock(block.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Collapse in={block.expanded}>
                          <Divider sx={{ mb: 2 }} />
                          <TextField
                            fullWidth
                            label="Block Title (optional)"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            size="small"
                            sx={{ mb: 2 }}
                          />

                          {block.type === 'code' && (
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                              <InputLabel>Language</InputLabel>
                              <Select
                                value={block.language || 'cpp'}
                                label="Language"
                                onChange={(e) => updateBlock(block.id, { language: e.target.value as CodeLanguage })}
                              >
                                {SUPPORTED_LANGUAGES.map(lang => (
                                  <MenuItem key={lang} value={lang}>
                                    {lang}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          <TextField
                            fullWidth
                            label="Content"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            multiline
                            rows={block.type === 'code' ? 10 : block.type === 'mermaid' ? 8 : 5}
                            sx={{
                              '& .MuiInputBase-input': {
                                fontFamily: block.type !== 'notes' ? 'monospace' : 'inherit',
                                fontSize: '0.85rem',
                              },
                            }}
                            placeholder={
                              block.type === 'code' ? '// Enter your code here...' :
                              block.type === 'mermaid' ? 'flowchart TD\n    A[Start] --> B[End]' :
                              'Enter your notes here...'
                            }
                          />
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Page
              </Button>
              <Button
                variant="outlined"
                onClick={exportAsJson}
                disabled={!title}
              >
                Export as JSON
              </Button>
              <Button
                variant="text"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </Box>
          </TabPanel>

          {/* JSON Input Mode */}
          <TabPanel value={inputMode} index={1}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Paste JSON Configuration
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyTemplate}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy Template'}
                </Button>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {JSON_DOCUMENTATION}
                </Typography>
              </Alert>

              {jsonError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {jsonError}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={20}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  if (e.target.value) validateJson(e.target.value);
                }}
                placeholder="Paste your JSON here..."
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleImportJson}
                disabled={!jsonInput || !!jsonError}
                startIcon={<AddIcon />}
              >
                Import and Edit
              </Button>
            </Paper>
          </TabPanel>
        </Grid>

        {/* Preview Section */}
        {showPreview && inputMode === 0 && (
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                position: 'sticky',
                top: 100,
                maxHeight: 'calc(100vh - 140px)',
                overflow: 'auto',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Live Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {title ? (
                <>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                  </Typography>
                  {summary && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {summary}
                    </Typography>
                  )}
                  {tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                      {tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  )}

                  {blocks.map((block) => (
                    <Paper
                      key={block.id}
                      elevation={0}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      {block.title && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getBlockIcon(block.type)}
                          <Typography variant="subtitle1" fontWeight={600}>
                            {block.title}
                          </Typography>
                        </Box>
                      )}
                      {renderBlockContent(block)}
                    </Paper>
                  ))}
                </>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  Start filling in the form to see a preview...
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
