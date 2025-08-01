import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Import highlight.js and languages
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

// Import highlight.js CSS theme
import 'highlight.js/styles/github.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('c#', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('golang', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

interface MessageContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export default function MessageContent({ content, isUser = false, className }: MessageContentProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback method for older browsers or when clipboard is not available
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isUser) {
    // For user messages, render as plain text with preserved whitespace
    return (
      <div className={cn("whitespace-pre-wrap break-words", className)}>
        {content}
      </div>
    );
  }

  // For AI messages, render as markdown with syntax highlighting
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize code block styling
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Check if it's inline code based on props or other criteria
            const inline = !className?.includes('language-');
            
            if (inline) {
              return (
                <code
                  className="px-2 py-1 rounded bg-muted text-sm font-mono leading-relaxed"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // Extract plain text from React children
            const getTextContent = (element: React.ReactNode): string => {
              if (element === null || element === undefined || typeof element === 'boolean') {
                return '';
              }
              if (typeof element === 'string' || typeof element === 'number') {
                return String(element);
              }
              if (Array.isArray(element)) {
                return element.map(getTextContent).join('');
              }
              if (element && typeof element === 'object' && 'props' in element && element.props?.children) {
                return getTextContent(element.props.children);
              }
              return '';
            };
            
            const codeString = getTextContent(children).replace(/\n$/, '');
            
            return (
              <div className="code-block-wrapper relative group border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
                  {language && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {language}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="copy-button h-6 px-2"
                    onClick={() => copyToClipboard(codeString)}
                  >
                    {copiedText === codeString ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre className="overflow-x-auto p-6 bg-muted/20 leading-relaxed">
                  <code className={cn(className, "block leading-relaxed text-sm")} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Customize blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic">
              {children}
            </blockquote>
          ),
          // Customize table styling
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          ),
          // Customize link styling
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}