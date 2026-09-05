"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
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
              <p className="font-body text-[18px] sm:text-[19px] text-[#2c2420] leading-[1.82] mb-6 tracking-normal">
                {children}
              </p>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-8 p-6 sm:p-7 bg-[#f6eee3]/80 border-l-4 border-primary rounded-r-2xl italic font-headline text-xl sm:text-2xl text-on-surface shadow-xs leading-relaxed">
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
              <span className="block my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || "Story image"}
                  className="w-full max-h-[550px] object-cover rounded-2xl shadow-md border border-outline-variant/30 block"
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
                  className="font-mono text-xs sm:text-sm bg-surface-container px-2 py-0.5 rounded text-primary font-semibold border border-outline-variant/30"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-8 rounded-2xl overflow-hidden shadow-md border border-outline-variant/30 group">
                <div className="bg-[#261f1b] px-4 py-2.5 text-[11px] font-mono text-outline-variant/80 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
                    <span className="ml-2">{match ? match[1] : "code"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined") {
                        navigator.clipboard.writeText(String(children));
                      }
                    }}
                    className="text-[11px] text-outline-variant hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-[#1f1915] p-5 text-[#f5eee6] font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
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
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          hr: () => <hr className="my-8 border-t border-outline-variant/40" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-outline-variant/30 shadow-sm">
              <table className="w-full text-left text-sm text-on-surface border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-surface-container p-3 font-semibold border-b border-outline-variant/30 text-xs uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 border-b border-outline-variant/20">{children}</td>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
