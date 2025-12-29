export type ContentType = 'topic' | 'lego-piece' | 'diagram' | 'collection';

export type Category = 'architecture' | 'core-systems' | 'control' | 'design';

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
  explanation: string;
  diagram?: string; // Mermaid source
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

export type ContentItem = Topic | LegoPiece | Diagram | Collection;

export interface TagInfo {
  name: string;
  color: string;
  description?: string;
  count?: number;
}
