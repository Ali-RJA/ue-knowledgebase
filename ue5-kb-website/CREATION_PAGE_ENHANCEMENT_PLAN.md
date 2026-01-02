# Creation Page Enhancement Plan

## Overview

This document outlines the comprehensive plan for enhancing the custom page creation feature on the UE5 Knowledgebase website. The plan covers replacing Supabase with MongoDB and adding JSON input capabilities.

## Changes Summary

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Replace Supabase with MongoDB | Pending |
| 2 | Add JSON input tab with schema validation | Pending |
| 3 | Add "Copy this prompt" functionality | Pending |
| 4 | Update deployment configuration | Pending |

---

## 1. MongoDB Integration

### 1.1 Environment Variables

**Current Supabase Variables (to remove):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**New MongoDB Variables:**
- `MONGO_URL` - Full MongoDB connection string
- `DATABASE_URL` - Alternative connection string (optional)

**Railway Configuration (`railway.json`):**
```json
{
  "env": {
    "groups": {
      "supabase": ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]
      // Remove supabase group
    }
  }
}
```

### 1.2 Dependencies

**Remove:**
- `@supabase/supabase-js`

**Add:**
- `mongodb` (^6.12.0)

### 1.3 New Database Module

**File:** `src/lib/mongodb.ts`

```typescript
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Environment variables
const mongoUrl = import.meta.env.VITE_MONGO_URL || import.meta.env.VITE_DATABASE_URL;

let client: MongoClient | null = null;
let db: Db | null = null;

// Collection name
export const CUSTOM_PAGES_COLLECTION = 'custom_pages';

// Interface for custom page document
export interface CustomPageDocument {
  _id?: ObjectId;
  created_at: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  blocks: CustomPageBlock[];
  published: boolean;
}

export interface CustomPageBlock {
  id: string;
  type: 'code' | 'notes' | 'mermaid';
  content: string;
  language?: string;
  title?: string;
}

// Connect to MongoDB
export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  if (!mongoUrl) {
    throw new Error('MongoDB URL not configured');
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(); // Uses default database from connection string

  return db;
};

// Get collection helper
export const getCollection = async <T extends Document>(name: string): Promise<Collection<T>> => {
  const database = await connectToDatabase();
  return database.collection<T>(name);
};

// Close connection
export const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

// Configuration check
export const isConfigured = (): boolean => !!mongoUrl;
```

### 1.4 API Functions

**File:** `src/lib/mongodb.ts` (continued)

```typescript
export const customPagesApi = {
  getAll: async () => {
    try {
      if (!isConfigured()) {
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const pages = await collection
        .find({ published: true })
        .sort({ created_at: -1 })
        .toArray();

      return { data: pages, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  getBySlug: async (slug: string) => {
    try {
      if (!isConfigured()) {
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const page = await collection.findOne({ slug, published: true });

      return { data: page, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  create: async (page: Omit<CustomPageDocument, '_id' | 'created_at'>) => {
    try {
      if (!isConfigured()) {
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const now = new Date().toISOString();

      const newPage = {
        ...page,
        created_at: now,
      };

      const result = await collection.insertOne(newPage as CustomPageDocument);
      return { data: { ...newPage, _id: result.insertedId }, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  update: async (id: string, updates: Partial<CustomPageDocument>) => {
    try {
      if (!isConfigured()) {
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const objectId = new ObjectId(id);

      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  delete: async (id: string) => {
    try {
      if (!isConfigured()) {
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const objectId = new ObjectId(id);

      await collection.deleteOne({ _id: objectId });
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },
};
```

### 1.5 Files to Delete

- `src/lib/supabase.ts` (entire file)

---

## 2. JSON Input Feature

### 2.1 UI Changes to CreateCustomPage.tsx

**Add Tab Navigation:**

```tsx
<Tabs
  value={inputMode}
  onChange={(_, newValue) => setInputMode(newValue)}
  indicatorColor="primary"
  textColor="primary"
>
  <Tab label="Manual Input" value="manual" />
  <Tab label="JSON Input" value="json" />
</Tabs>
```

**State Management:**
```typescript
type InputMode = 'manual' | 'json';

const [inputMode, setInputMode] = useState<InputMode>('manual');
const [jsonInput, setJsonInput] = useState<string>('');
const [jsonError, setJsonError] = useState<string | null>(null);
```

### 2.2 JSON Schema Validation

**Add JSON Schema Interface:**

```typescript
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
```

**Validation Function:**

```typescript
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
```

### 2.3 JSON to Form Data Conversion

```typescript
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
```

### 2.4 "Copy This Prompt" Feature

**Generate Comprehensive Prompt:**

```typescript
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
      "content": "#pragma once\\n\\n#include \"CoreMinimal.h\"\\n#include \"GameplayAttribute.h\"\\n#include \"MyAttributeSet.generated.h\"\\n\\nUCLASS()\\nclass UMyAttributeSet : public UGameplayAttributeSet\\n{\\n    GENERATED_BODY()\\npublic:\\n    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = \"Attributes\")\\n    FGameplayAttributeData Health = 100.0f;\\n\\n    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = \"Attributes\")\\n    FGameplayAttributeData MaxHealth = 100.0f;\\n};"
    },
    {
      "type": "mermaid",
      "content": "graph LR\\n    A[AbilitySystemComponent] -->|Contains| B[AttributeSet]\\n    B -->|Manages| C[Attribute Data]\\n    C -->|Used By| D[GameplayEffects]"
    }
  ]
}

## Notes
- All JSON must be valid (proper escaping, no trailing commas)
- Use \\n for newlines in string values
- Preview your page after creation to verify formatting`;
};
```

**Copy to Clipboard Function:**

```typescript
const copyPromptToClipboard = async () => {
  const prompt = generateJsonPrompt();
  try {
    await navigator.clipboard.writeText(prompt);
    enqueueSnackbar('Prompt copied to clipboard!', { variant: 'success' });
  } catch (error) {
    enqueueSnackbar('Failed to copy prompt', { variant: 'error' });
  }
};
```

### 2.5 JSON Input Tab UI

```tsx
<Box sx={{ p: 3 }}>
  {inputMode === 'json' && (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Paste your JSON page data below
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={copyPromptToClipboard}
        >
          Copy This Prompt
        </Button>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={20}
        value={jsonInput}
        onChange={(e) => {
          setJsonInput(e.target.value);
          setJsonError(null);
        }}
        placeholder={`{\n  "title": "Page Title",\n  "summary": "Summary...",\n  ...\n}`}
        error={!!jsonError}
        helperText={jsonError}
        sx={{ mb: 2, fontFamily: 'monospace' }}
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
    </>
  )}
</Box>
```

### 2.6 Apply JSON Function

```typescript
const applyJsonToForm = () => {
  const validation = validateJsonInput(jsonInput);

  if (!validation.valid) {
    setJsonError(validation.error || 'Invalid JSON');
    return;
  }

  const formData = parseJsonToFormData(validation.data!);
  setFormData(formData);
  enqueueSnackbar('JSON applied to form! Review and save.', { variant: 'success' });
  setInputMode('manual'); // Switch back to manual for review
};
```

---

## 3. Files to Modify

### 3.1 Primary Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/mongodb.ts` | Create | New MongoDB client module |
| `src/lib/supabase.ts` | Delete | Remove Supabase client |
| `src/pages/CreateCustomPage.tsx` | Modify | Add JSON input tab and MongoDB integration |
| `package.json` | Modify | Update dependencies |
| `railway.json` | Modify | Update environment groups |

### 3.2 Secondary Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/api.ts` | Modify | Update to use MongoDB instead of Supabase |
| `src/pages/ViewCustomPage.tsx` | Modify | Update to use MongoDB |
| `src/pages/AdminDashboard.tsx` | Modify | Update to use MongoDB (if exists) |

---

## 4. Implementation Order

### Phase 1: MongoDB Integration
1. Remove `@supabase/supabase-js` from `package.json`
2. Add `mongodb` to `package.json`
3. Create `src/lib/mongodb.ts`
4. Update `CreateCustomPage.tsx` to use MongoDB
5. Update `ViewCustomPage.tsx` to use MongoDB
6. Update `railway.json` environment groups
7. Delete `src/lib/supabase.ts`

### Phase 2: JSON Input Feature
1. Add input mode state (`manual` | `json`)
2. Add JSON schema validation
3. Create "Copy This Prompt" functionality
4. Add JSON input tab UI
5. Add JSON to form parsing
6. Test JSON validation and import

### Phase 3: Testing
1. Test MongoDB connection
2. Test page creation via manual input
3. Test page creation via JSON input
4. Test JSON schema validation (invalid JSON, missing fields)
5. Test "Copy This Prompt" button
6. Verify deployment configuration

---

## 5. Validation Checklist

### MongoDB Integration
- [ ] MongoDB client connects successfully
- [ ] Pages can be created and saved
- [ ] Pages can be retrieved by slug
- [ ] Pages list shows all published pages
- [ ] Pages can be deleted
- [ ] Error handling works when MongoDB is not configured

### JSON Input Feature
- [ ] Tab switching between manual and JSON modes
- [ ] JSON syntax validation works
- [ ] JSON schema validation (required fields)
- [ ] "Copy This Prompt" copies complete prompt
- [ ] Applied JSON populates form correctly
- [ ] Invalid JSON shows clear error messages
- [ ] Empty JSON shows appropriate validation

### UI/UX
- [ ] Tabs are clearly labeled and accessible
- [ ] Copy button has appropriate icon and label
- [ ] Validation errors are visible and helpful
- [ ] Form switches to manual mode after JSON application
- [ ] Success/error snackbars appear appropriately

---

## 6. Estimated Changes

| Metric | Count |
|--------|-------|
| New files created | 1 |
| Files deleted | 1 |
| Files modified | 4-6 |
| Lines of code (new) | ~300 |
| Lines of code (removed) | ~200 |

---

## 7. Rollback Plan

If MongoDB integration fails:
1. Keep `supabase.ts` as backup until MongoDB is verified
2. Use feature flag for MongoDB vs Supabase toggle
3. Railway environment variables can be updated without redeployment

If JSON feature causes issues:
1. The feature is isolated to CreateCustomPage.tsx
2. Can disable JSON tab by default if needed
3. Manual input mode always works

---

## 8. Next Steps

1. **Execute Phase 1**: Start with MongoDB integration
   - Update dependencies
   - Create MongoDB client
   - Test basic connection

2. **Execute Phase 2**: Implement JSON input
   - Add state and tabs
   - Create validation functions
   - Implement copy prompt

3. **Execute Phase 3**: Test and verify
   - Test all features
   - Verify Railway deployment
   - Commit and push changes

---

## References

- MongoDB Node.js Driver: https://www.mongodb.com/docs/drivers/node/current/
- Railway MongoDB: https://docs.railway.com/databases/mongodb
- Mermaid Syntax: https://mermaid.js.org/intro/
- JSON Schema: https://json-schema.org/
