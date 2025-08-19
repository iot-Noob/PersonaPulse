// components/MarkdownMessage.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Optional: highlight.js theme for syntax highlighting
import "highlight.js/styles/github-dark-dimmed.css";

const MarkdownMessage = ({ content }) => {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold">{children}</h2>
          ),
          p: ({ children }) => <p className="mb-2 sm:mb-3">{children}</p>,
          li: ({ children }) => <li className="list-disc ml-6">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-info pl-4 italic text-info-content">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {children}
            </a>
          ),
          code({ inline, className, children, ...props }) {
            return inline ? (
              <code className="bg-base-200 px-1 py-0.5 rounded text-xs sm:text-sm">
                {children}
              </code>
            ) : (
              <pre className="chat-bubble bg-base-200 text-base-content p-3 rounded-box overflow-x-auto text-xs sm:text-sm shadow">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-base-300 w-full text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-base-200 text-base-content">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-base-300 px-4 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-base-300 px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
