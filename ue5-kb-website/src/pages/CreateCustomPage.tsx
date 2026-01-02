import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Collapse,
  Grid,
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
import { tagColors, getTagColor, allTags } from '../data/tags';
import { customPagesApi, isMongoConfigured } from '../lib/mongodb';

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

// JSON input mode type
type InputMode = 'manual' | 'json';

// JSON schema interface
interface JsonPageInput {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  blocks: Array<{
    id?: string;
    type: 'code' | 'notes' | 'mermaid';
    content: string;
    language?: string;
    title?: string;
  }>;
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

// Generate JSON prompt for copy functionality
const generateJsonPrompt = (): string => {
  const availableTags = allTags.map(t => t.name).join(', ');

  return `JSON Page Creation Prompt for UE5 Knowledgebase

## Overview
Use this JSON format to create custom pages for the UE5 Knowledgebase website. This format allows you to structure complex technical content with multiple content blocks including code examples, markdown notes, and Mermaid diagrams.

## JSON Structure

{
  "title": "Page Title",
  "summary": "A concise 1-2 sentence summary (max 200 characters recommended)",
  "category": "Category Name",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "blocks": [
    {
      "type": "code|notes|mermaid",
      "content": "Block content",
      "language": "cpp|typescript|python (only for code blocks)",
      "title": "Optional block title"
    }
  ]
}

## Block Types

1. CODE BLOCKS
   - Use type: "code"
   - Required fields: content, language
   - Optional: title
   - Supported languages: cpp, typescript, python, javascript, bash, html, css
   - Example:
     {
       "type": "code",
       "language": "cpp",
       "title": "Character Movement",
       "content": "// Your C++ code here..."
     }

2. NOTES BLOCKS
   - Use type: "notes"
   - Supports Markdown formatting
   - Use for explanations, tutorials, documentation
   - Example:
     {
       "type": "notes",
       "content": "## Introduction\\n\\nThis guide covers..."
     }

3. MERMAID DIAGRAMS
   - Use type: "mermaid"
   - Content should be valid Mermaid syntax
   - Example:
     {
       "type": "mermaid",
       "content": "graph TD\\n    A[Start] --> B[Process]\\n    B --> C[End]"
     }

## Best Practices

### Title
- Keep it concise (max 80 characters)
- Use clear, descriptive naming
- Include key technology name (e.g., "GAS Attribute Sets")

### Summary
- Maximum 200 characters
- Summarize the page content in 1-2 sentences
- Include key takeaways or outcomes
- Avoid filler words

### Tags
- Use 3-7 tags per page
- Available tags: ${availableTags}
- Include specific technology tags (GAS, AI, Animation)
- Include pattern tags (Observer, State Machine)
- Include category tags (Character, Combat, Data)

### Blocks
- Start with an introduction notes block
- Alternate between code and notes for tutorials
- Use mermaid diagrams for complex flows
- Keep code examples focused and commented
- Each block should serve a clear purpose

## Example Complete Page

{
  "title": "GAS Attribute Set Implementation",
  "summary": "Learn how to implement GAS Attribute Sets for managing character stats and attributes in Unreal Engine 5.",
  "category": "GAS",
  "tags": ["GAS", "ASC", "Data", "Character", "Attribute"],
  "blocks": [
    {
      "type": "notes",
      "content": "## Introduction\\n\\nGameplay Attribute Sets are fundamental to the GAS system..."
    },
    {
      "type": "code",
      "language": "cpp",
      "title": "UMyAttributeSet.h",
      "content": "#pragma once\\n\\n#include \"CoreMinimal.h\"\\n#include \"GameplayAttribute.h\"\\n#include \"MyAttributeSet.generated.h\"\\n\\nUCLASS()\\nclass UMyAttributeSet : public UGameplayAttributeSet\\n{\\n    GENERATED_BODY()\\npublic:\\n    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = \\\"Attributes\\\")\\n    FGameplayAttributeData Health = 100.0f;\\n\\n    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = \\\"Attributes\\\")\\n    FGameplayAttributeData MaxHealth = 100.0f;\\n};"
    },
    {
      "type": "mermaid",
      "content": "graph LR\\n    A[AbilitySystemComponent] -->|Contains| B[AttributeSet]\\n    B -->|Manages| C[Attribute Data]\\n    C -->|Used By| D[GameplayEffects]"
    }
  ]
}

## Notes
- All JSON must be valid (proper escaping, no trailing commas)
- Use \\\\n for newlines in string values
- Preview your page after creation to verify formatting`;
};

// Validate JSON input
const validateJsonInput = (json: string): { valid: boolean; data?: JsonPageInput; error?: string } => {
  try {
    const parsed = JSON.parse(json);

    // Check required fields
    if (!parsed.title || typeof parsed.title !== 'string') {
      return { valid: false, error: 'Missing or invalid required field: title (string)' };
    }
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      return { valid: false, error: 'Missing or invalid required field: summary (string)' };
    }
    if (!parsed.category || typeof parsed.category !== 'string') {
      return { valid: false, error: 'Missing or invalid required field: category (string)' };
    }
    if (!Array.isArray(parsed.tags)) {
      return { valid: false, error: 'Missing or invalid required field: tags (array)' };
    }
    if (!Array.isArray(parsed.blocks)) {
      return { valid: false, error: 'Missing or invalid required field: blocks (array)' };
    }

    // Validate blocks
    for (let i = 0; i < parsed.blocks.length; i++) {
      const block = parsed.blocks[i];
      if (!block.type || !['code', 'notes', 'mermaid'].includes(block.type)) {
        return { valid: false, error: `Invalid block type at index ${i}` };
      }
      if (!block.content || typeof block.content !== 'string') {
        return { valid: false, error: `Missing content for block at index ${i}` };
      }
    }

    return { valid: true, data: parsed as JsonPageInput };
  } catch (error) {
    return { valid: false, error: `JSON parse error: ${(error as Error).message}` };
  }
};

// Parse JSON to form data
const parseJsonToFormData = (jsonData: JsonPageInput): CustomPageFormData => {
  return {
    title: jsonData.title,
    summary: jsonData.summary,
    category: jsonData.category as Category,
    tags: jsonData.tags,
    blocks: jsonData.blocks.map((block, index) => ({
      id: block.id || `block-${Date.now()}-${index}`,
      type: block.type as BlockType,
      content: block.content,
      language: block.language,
      title: block.title,
    })),
  };
};

export const CreateCustomPage = () => {
  const [formData, setFormData] = useState<CustomPageFormData>({
    title: '',
    summary: '',
    tags: [],
    category: 'core-systems',
    blocks: [],
  });

  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [previewMermaid, setPreviewMermaid] = useState<Record<string, string>>({});
  const [mermaidErrors, setMermaidErrors] = useState<Record<string, string>>({});
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [addBlockAnchor, setAddBlockAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [mongodbStatus, setMongodbStatus] = useState<{ configured: boolean; checked: boolean }>({
    configured: false,
    checked: false,
  });

  // Simple snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  // Check MongoDB configuration
  useEffect(() => {
    setMongodbStatus({
      configured: isMongoConfigured(),
      checked: true,
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

  // Copy JSON prompt to clipboard
  const copyJsonPrompt = async () => {
    const prompt = generateJsonPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      setSnackbar({ open: true, message: 'Prompt copied to clipboard!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy prompt', severity: 'error' });
    }
  };

  // Apply JSON to form data
  const applyJsonToForm = () => {
    const validation = validateJsonInput(jsonInput);

    if (!validation.valid) {
      setJsonError(validation.error || 'Invalid JSON');
      return;
    }

    const parsedFormData = parseJsonToFormData(validation.data!);
    setFormData(parsedFormData);
    setSnackbar({ open: true, message: 'JSON applied to form! Review and save.', severity: 'success' });
    setInputMode('manual'); // Switch back to manual for review
  };

  // Database save functionality (using MongoDB)
  const handleSaveToDatabase = async () => {
    if (!formData.title.trim()) {
      setSaveMessage('Please enter a title');
      setSaveStatus('error');
      return;
    }

    if (!isMongoConfigured()) {
      setSaveMessage('MongoDB is not configured. Please set VITE_MONGO_URL environment variable.');
      setSaveStatus('error');
      return;
    }

    setSaveDialogOpen(true);
    setSaveStatus('saving');
    setSaveMessage('');

    try {
      const slug = generateSlug(formData.title);
      const record = {
        title: formData.title,
        slug: slug || `custom-page-${Date.now()}`,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags,
        blocks: formData.blocks,
        published: true,
      };

      const { error } = await customPagesApi.create(record);

      if (error) {
        throw new Error(error);
      }

      setSaveStatus('success');
      setSaveMessage(`Page "${formData.title}" saved successfully!`);
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

      {/* MongoDB Status Alert */}
      {mongodbStatus.checked && !mongodbStatus.configured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          MongoDB is not configured. Set VITE_MONGO_URL environment variable to enable database saving.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid xs={12} lg={7}>
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
            {/* Input Mode Tabs */}
            <Tabs
              value={inputMode}
              onChange={(_, newValue) => setInputMode(newValue)}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Manual Input" value="manual" />
              <Tab label="JSON Input" value="json" />
            </Tabs>

            {/* JSON Input Mode */}
            {inputMode === 'json' && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Paste your JSON page data below
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={copyJsonPrompt}
                  >
                    Copy This Prompt
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError(null);
                  }}
                  placeholder={`{\n  "title": "Page Title",\n  "summary": "Summary...",\n  "category": "architecture",\n  "tags": ["GAS", "Animation"],\n  "blocks": [\n    {\n      "type": "notes",\n      "content": "Your content..."\n    }\n  ]\n}`}
                  error={!!jsonError}
                  helperText={jsonError}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={applyJsonToForm}
                    disabled={!jsonInput.trim()}
                  >
                    Apply JSON to Form
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setJsonInput('');
                      setJsonError(null);
                    }}
                  >
                    Clear
                  </Button>
                </Box>

                <Collapse in={!!jsonError}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {jsonError}
                  </Alert>
                </Collapse>
              </Box>
            )}

            {/* Manual Input Mode */}
            {inputMode === 'manual' && (
              <>
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
                    helperText={`${formData.summary.length}/200 characters (recommended max)`}
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
                    disabled={!formData.title.trim() || !mongodbStatus.configured}
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
              </>
            )}
          </Paper>
        </Grid>

        {/* Preview Section */}
        <Grid xs={12} lg={5}>
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
        </Grid>
      </Grid>

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

      {/* Snackbar */}
      <Alert
        severity={snackbar.severity}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: snackbar.open ? 'flex' : 'none',
        }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        {snackbar.message}
      </Alert>
    </Box>
  );
};
