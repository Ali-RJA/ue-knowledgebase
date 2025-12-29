import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Box, Typography, Link, Divider } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 3, mb: 1.5, fontWeight: 600 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2.5, mb: 1.25, fontWeight: 600 }}>
              {children}
            </Typography>
          ),
          h4: ({ children }) => (
            <Typography variant="h6" component="h4" gutterBottom sx={{ mt: 2, mb: 1 }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body1" paragraph sx={{ mb: 2, lineHeight: 1.8 }}>
              {children}
            </Typography>
          ),
          a: ({ href, children }) => (
            <Link href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {children}
            </Link>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || '');
            // Extract text content from children, handling both strings and React nodes
            const extractText = (node: React.ReactNode): string => {
              if (typeof node === 'string') return node;
              if (typeof node === 'number') return String(node);
              if (!node) return '';
              if (Array.isArray(node)) return node.map(extractText).join('');
              if (typeof node === 'object' && node !== null && 'props' in node) {
                const element = node as { props?: { children?: React.ReactNode } };
                return extractText(element.props?.children);
              }
              return '';
            };
            const codeString = extractText(children).replace(/\n$/, '');
            const language = match ? match[1] : undefined;
            const inline = !className && !codeString.includes('\n');

            // Render mermaid code blocks as diagrams
            if (language === 'mermaid') {
              return <MermaidDiagram chart={codeString} />;
            }

            if (inline) {
              return <CodeBlock code={codeString} inline />;
            }

            return <CodeBlock code={codeString} language={language} />;
          },
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 3, mb: 2 }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
              {children}
            </Typography>
          ),
          blockquote: ({ children }) => (
            <Box
              component="blockquote"
              sx={{
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                py: 0.5,
                my: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                '& p': { mb: 0 },
              }}
            >
              {children}
            </Box>
          ),
          hr: () => <Divider sx={{ my: 3 }} />,
          table: ({ children }) => (
            <Box sx={{ overflowX: 'auto', my: 2 }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th': {
                    bgcolor: 'action.hover',
                    p: 1.5,
                    textAlign: 'left',
                    borderBottom: 2,
                    borderColor: 'divider',
                    fontWeight: 600,
                  },
                  '& td': {
                    p: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                  },
                }}
              >
                {children}
              </Box>
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};
