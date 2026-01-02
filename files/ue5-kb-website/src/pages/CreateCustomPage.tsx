import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import mermaid from 'mermaid';
import type { Category } from '../types/content';
import { tagColors, getTagColor } from '../data/tags';

interface CustomPageFormData {
  title: string;
  summary: string;
  tags: string[];
  category: Category;
  mermaidCode: string;
  notes: string;
}

const categories: Category[] = ['architecture', 'core-systems', 'control', 'design'];

const suggestedTags = Object.keys(tagColors);

export const CreateCustomPage = () => {
  const [formData, setFormData] = useState<CustomPageFormData>({
    title: '',
    summary: '',
    tags: [],
    category: 'core-systems',
    mermaidCode: '',
    notes: '',
  });

  const [previewMermaid, setPreviewMermaid] = useState<string>('');
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{
    markdown: string;
    mermaid: string;
    indexUpdate: string;
  } | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState(0);

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

  // Live mermaid preview
  useEffect(() => {
    const renderPreview = async () => {
      if (!formData.mermaidCode.trim()) {
        setPreviewMermaid('');
        setMermaidError(null);
        return;
      }

      try {
        const trimmedChart = formData.mermaidCode.trim();
        const validStarters = [
          'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
          'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
          'gitGraph', 'mindmap', 'timeline', 'quadrantChart',
          'xychart', 'sankey', 'block'
        ];
        const hasValidStart = validStarters.some(starter =>
          trimmedChart.toLowerCase().startsWith(starter.toLowerCase())
        );

        if (!hasValidStart) {
          throw new Error('Invalid mermaid diagram syntax');
        }

        const uniqueId = `preview-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, trimmedChart);
        setPreviewMermaid(svg);
        setMermaidError(null);
      } catch (err) {
        console.error('Mermaid preview error:', err);
        setMermaidError(err instanceof Error ? err.message : 'Invalid mermaid syntax');
        setPreviewMermaid('');
      }
    };

    const timeoutId = setTimeout(renderPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.mermaidCode]);

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

  const generateFiles = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const slug = generateSlug(formData.title);
    const safeSlug = slug || `custom-page-${Date.now()}`;
    const id = `custom-${Date.now().toString(36)}`;

    // Generate markdown content
    const markdownContent = `# ${formData.title}

> ${formData.summary}

---

${formData.mermaidCode ? `## Diagram

\`\`\`mermaid
${formData.mermaidCode}
\`\`\`

---` : ''}

${formData.notes ? `## Notes

\`\`\`text
${formData.notes}
\`\`\`

---` : ''}

## Tags
${formData.tags.map(tag => `- ${tag}`).join('\n')}
`;

    // Generate mermaid file content (if diagram exists)
    const mermaidContent = formData.mermaidCode;

    // Generate content-index.ts update
    const indexUpdate = `// Add to topics array in src/data/content-index.ts
{
  id: '${id}',
  slug: '${safeSlug}',
  title: '${formData.title}',
  type: 'topic',
  category: '${formData.category}',
  tags: [${formData.tags.map(t => `'${t}'`).join(', ')}],
  summary: '${formData.summary}',
  content: '',
  sourcePath: '${safeSlug}.md',
  relatedItems: [],
},
`;

    setGeneratedFiles({
      markdown: markdownContent,
      mermaid: mermaidContent,
      indexUpdate: indexUpdate,
    });

    setActiveTab(0);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!generatedFiles) return;

    const slug = generateSlug(formData.title) || `custom-page-${Date.now()}`;

    // Download markdown file
    if (generatedFiles.markdown) {
      downloadFile(generatedFiles.markdown, `${slug}.md`);
    }

    // Download mermaid file if exists
    if (generatedFiles.mermaid) {
      downloadFile(generatedFiles.mermaid, `${slug}.mermaid`);
    }

    // Download index update instructions
    downloadFile(generatedFiles.indexUpdate, `${slug}-index-update.txt`);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        Create Custom Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new page with a mermaid diagram and notes. Download the generated files and add them to your project.
      </Typography>

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Page Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
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
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                  />
                )}
              />

              <Divider sx={{ my: 1 }} />

              <Typography variant="h6" gutterBottom>
                Mermaid Diagram
              </Typography>

              <TextField
                label="Mermaid Code"
                value={formData.mermaidCode}
                onChange={(e) => setFormData({ ...formData, mermaidCode: e.target.value })}
                fullWidth
                multiline
                rows={10}
                placeholder="flowchart TD
    A[Start] --> B[Process]
    B --> C[End]"
                fontFamily="monospace"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  },
                }}
              />

              {mermaidError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {mermaidError}
                </Alert>
              )}

              <Divider sx={{ my: 1 }} />

              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>

              <TextField
                label="Notes (text code block only)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={6}
                placeholder="Enter your notes here..."
                helperText="Notes will be rendered as a text code block"
              />

              <Button
                variant="contained"
                size="large"
                onClick={generateFiles}
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Generate Files
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Live Preview
            </Typography>

            {formData.mermaidCode ? (
              <Box>
                {mermaidError ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Diagram preview unavailable - fix syntax errors
                  </Alert>
                ) : previewMermaid ? (
                  <Card sx={{ bgcolor: '#0d1117', border: 1, borderColor: 'rgba(97, 218, 251, 0.3)' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          '& svg': {
                            display: 'block',
                            maxWidth: '100%',
                            height: 'auto',
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: previewMermaid }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <Typography color="text.secondary">Rendering diagram...</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  color: 'text.secondary',
                }}
              >
                <Typography>Enter mermaid code to see preview</Typography>
              </Box>
            )}
          </Paper>

          {/* Generated Files Section */}
          {generatedFiles && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 3,
                bgcolor: 'rgba(97, 218, 251, 0.05)',
                borderRadius: 2,
                border: 1,
                borderColor: 'rgba(97, 218, 251, 0.3)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Generated Files
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDownloadAll}
                  startIcon={<DownloadIcon />}
                >
                  Download All
                </Button>
              </Box>

              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Markdown" />
                {generatedFiles.mermaid && <Tab label="Mermaid" />}
                <Tab label="Index Update" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton size="small" onClick={() => handleCopy(generatedFiles.markdown, 'markdown')}>
                      {copied.markdown ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#0d1117',
                      maxHeight: 300,
                      overflow: 'auto',
                      '& pre': { m: 0, fontSize: '0.75rem' },
                    }}
                  >
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {generatedFiles.markdown}
                    </pre>
                  </Paper>
                </Box>
              )}

              {activeTab === 1 && generatedFiles.mermaid && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton size="small" onClick={() => handleCopy(generatedFiles.mermaid, 'mermaid')}>
                      {copied.mermaid ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#0d1117',
                      maxHeight: 300,
                      overflow: 'auto',
                      '& pre': { m: 0, fontSize: '0.75rem' },
                    }}
                  >
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {generatedFiles.mermaid}
                    </pre>
                  </Paper>
                </Box>
              )}

              {activeTab === (generatedFiles.mermaid ? 2 : 1) && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton size="small" onClick={() => handleCopy(generatedFiles.indexUpdate, 'index')}>
                      {copied.index ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#0d1117',
                      maxHeight: 300,
                      overflow: 'auto',
                      '& pre': { m: 0, fontSize: '0.75rem' },
                    }}
                  >
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {generatedFiles.indexUpdate}
                    </pre>
                  </Paper>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>Next Steps:</Typography>
                <ol style={{ margin: '8px 0', paddingLeft: 20, fontSize: '0.85rem' }}>
                  <li>Download the markdown file to <code>public/content/</code></li>
                  {generatedFiles.mermaid && <li>Download the mermaid file to <code>public/content/</code></li>}
                  <li>Copy the index update and add it to <code>src/data/content-index.ts</code></li>
                  <li>Commit and push to see the new page</li>
                </ol>
              </Alert>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
