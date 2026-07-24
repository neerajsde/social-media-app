'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export default function MarkdownRenderer({ content, className = '', inline = false }: MarkdownRendererProps) {
  // Pre-process content to convert LaTeX-style math delimiters to standard markdown math delimiters
  const processedContent = (content || '')
    .replace(/\\\[/g, '$$$$') // Replace \[ with $$
    .replace(/\\\]/g, '$$$$') // Replace \] with $$
    .replace(/\\\(/g, '$')    // Replace \( with $
    .replace(/\\\)/g, '$');   // Replace \) with $

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, {
            ...defaultSchema,
            attributes: {
              ...defaultSchema.attributes,
              '*': [...(defaultSchema.attributes?.['*'] || []), 'align', 'style', 'className']
            }
          }],
          rehypeKatex
        ]}
        components={{
          a: ({ node, ...props }) => (
            <a className="text-brand-dark dark:text-brand-medium hover:underline font-medium break-words" {...props} />
          ),
          p: ({ node, ...props }) => (
            inline ? 
              <span className="whitespace-pre-wrap inline" {...props} /> : 
              <div className="whitespace-pre-wrap mb-4 last:mb-0 leading-relaxed" {...props} />
          ),
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 leading-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 leading-tight" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 leading-tight" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-4 mb-2 leading-tight" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-brand-medium" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-brand-medium" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-brand-medium/50 pl-4 py-1 my-4 text-white/70 bg-brand-medium/5 rounded-r-lg italic" {...props} />
          ),
          code: ({ node, inline: isInline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !isInline ? (
              <pre className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto my-4 text-[13px] font-mono shadow-inner">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-black/30 border border-white/10 text-brand-light rounded-md px-1.5 py-0.5 text-[0.9em] font-mono" {...props}>
                {children}
              </code>
            );
          },
          hr: ({ node, ...props }) => <hr className="border-white/10 my-6" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-white/10 rounded-xl">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-white/5 px-4 py-3 font-semibold border-b border-white/10" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-white/5 last:border-0" {...props} />,
          img: ({ node, ...props }) => <img className="rounded-xl max-h-[500px] object-cover my-4 border border-white/10 shadow-lg" {...props} />
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
