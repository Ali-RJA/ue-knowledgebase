export type ContentType = 'topic' | 'lego-piece' | 'diagram' | 'collection' | 'custom-page';

export type Category = 'architecture' | 'core-systems' | 'control' | 'design' | 'custom';

// Block types for custom pages
export type BlockType = 'code' | 'notes' | 'mermaid' | 'table';

export type CodeLanguage =
  | 'cpp' | 'csharp' | 'blueprint'
  | 'html' | 'css' | 'javascript' | 'typescript'
  | 'json' | 'python' | 'sql' | 'bash' | 'shell';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  language?: CodeLanguage;
  title?: string;
}

export interface BaseContent {
  id: string;
  slug: string;
  title: string;
  type: ContentType;
  tags: string[];
  summary: string;
  relatedItems?: string[];
}

export interface Topic extends BaseContent {
  type: 'topic';
  category: Category;
  content: string; // Markdown content
  sourcePath: string;
}

export interface LegoPiece extends BaseContent {
  type: 'lego-piece';
  pieceType: string; // 'Component', 'Utility', 'Pattern', etc.
  codeSnippet: string;
  explanation: string; // HTML content
  diagram?: string; // Mermaid source
  concepts: string[]; // Key concepts
  practices: string[]; // Best practices
  relatedTopics: string[];
}

export interface Diagram extends BaseContent {
  type: 'diagram';
  category: Category;
  mermaidSource: string;
  sourcePath: string;
  relatedTopics: string[];
}

export interface Collection extends BaseContent {
  type: 'collection';
  htmlContent: string;
  sourcePath: string;
}

export interface CustomPage extends BaseContent {
  type: 'custom-page';
  category: Category;
  blocks: ContentBlock[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ContentItem = Topic | LegoPiece | Diagram | Collection | CustomPage;

// JSON input structure for creating custom pages
export interface CustomPageInput {
  title: string;
  slug: string;
  summary: string;
  category: Category;
  tags: string[];
  blocks: ContentBlock[];
  published: boolean;
}

export interface TagInfo {
  name: string;
  color: string;
  description?: string;
  count?: number;
}
