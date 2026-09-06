"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function HighlightedCodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const rawCode = String(children).replace(/\n$/, "");
  const lang = match ? match[1].toLowerCase() : "text";

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const grammar =
    Prism.languages[lang] ||
    Prism.languages.javascript ||
    Prism.languages.markup;

  let highlighted = rawCode;
  if (grammar) {
    try {
      highlighted = Prism.highlight(rawCode, grammar, lang);
    } catch {
      highlighted = rawCode;
    }
  }

  return (
    <div className="my-8 rounded-none overflow-hidden shadow-xs border border-outline-variant/40 group">
      <div className="bg-[#1f1915] px-4 py-2.5 text-[11px] font-mono text-outline-variant/80 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
          <span className="ml-1 text-xs text-[#f0a878] font-semibold lowercase">
            {lang}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] text-outline-variant hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-[#161210] p-5 text-[#f5eee6] font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
        <code
          className={`language-${lang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-body ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mt-10 mb-4 tracking-tight leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface mt-10 mb-3 tracking-tight leading-snug">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mt-8 mb-2 tracking-tight leading-snug">
              {children}
            </h3>
          ),
          p: ({ children, node }) => {
            const hasImage = (node as any)?.children?.some(
              (child: any) => child.type === "element" && child.tagName === "img"
            );
            if (hasImage) {
              return <div className="mb-6 leading-relaxed">{children}</div>;
            }
            return (
              <p className="font-body text-[18px] sm:text-[19px] text-on-surface leading-[1.82] mb-6 tracking-normal">
                {children}
              </p>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-8 p-6 sm:p-7 bg-surface-container-low border-l-4 border-primary rounded-none italic font-headline text-xl sm:text-2xl text-on-surface shadow-xs leading-relaxed">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-primary font-semibold underline underline-offset-4 hover:text-primary-container transition-colors"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <span className="block my-8 sm:my-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || "Story image"}
                  className="w-full h-auto max-w-full rounded-none border border-outline-variant/30 shadow-xs block mx-auto object-contain"
                  loading="lazy"
                />
                {alt && (
                  <span className="block text-center text-xs text-on-surface-variant mt-2.5 font-mono italic">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="font-mono text-xs sm:text-sm bg-surface-container px-2 py-0.5 rounded-none text-primary font-semibold border border-outline-variant/30"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <HighlightedCodeBlock className={className}>
                {children}
              </HighlightedCodeBlock>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-5 font-body text-base sm:text-lg text-on-surface">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-5 font-body text-base sm:text-lg text-on-surface">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed text-on-surface">{children}</li>,
          hr: () => <hr className="my-8 border-t border-outline-variant/40" />,
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto rounded-none border border-outline-variant/40 shadow-xs">
              <table className="w-full min-w-full text-left text-sm text-on-surface border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-container-low border-b-2 border-outline-variant/40">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-outline-variant/20 bg-surface">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-surface-container-low transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-on-surface border-x first:border-l-0 last:border-r-0 border-outline-variant/20">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-on-surface border-x first:border-l-0 last:border-r-0 border-outline-variant/15 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
