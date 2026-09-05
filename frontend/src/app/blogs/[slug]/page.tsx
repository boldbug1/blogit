"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PostDetailSkeleton } from "@/components/Skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { api, BlogDetail, formatUtcDate } from "@/lib/api";
import {
  ArrowLeft,
  Share2,
  Check,
  Clock,
} from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (slug) {
      api.blogs
        .getBySlug(slug)
        .then((data) => {
          setBlog(data);
        })
        .catch((err) => {
          setError(err.message || "Story not found in database");
          setBlog(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf5ee]">
        <Navbar />
        <main className="w-full flex-1">
          <PostDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog || error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf5ee]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center max-w-md mx-auto">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mb-3">
            Story Not Found
          </h1>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            The dispatch you are looking for is not in the database or may have
            been updated.
          </p>
          <Link
            href="/"
            className="btn-primary-warm text-xs"
          >
            Back to Stories
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const wordCount = blog.body
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const dateStr = formatUtcDate(blog.created_at);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf5ee] relative text-on-surface">
      {/* Scroll Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-75 ease-out shadow-xs"
        style={{ width: `${readingProgress}%` }}
      />

      <Navbar />

      <main className="w-full pt-32 pb-24 flex-1">
        <article className="max-w-[740px] mx-auto px-6 space-y-12">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to stories</span>
            </Link>

            <span className="text-[11px] font-mono uppercase tracking-widest text-secondary font-semibold">
              Published Dispatch
            </span>
          </div>

          {/* Title & Author Byline Header */}
          <header className="space-y-8 pb-8 border-b border-outline-variant/30">
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-[1.14] tracking-[-0.02em]">
              {blog.title}
            </h1>

            {/* Author Byline Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs ring-2 ring-primary/20 shadow-xs">
                  {blog.author_name
                    ? blog.author_name.slice(0, 2).toUpperCase()
                    : "AU"}
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-on-surface font-headline tracking-tight">
                    {blog.author_name || "Author"}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {readTime} min read
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary-warm px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  title="Share story link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">
                        Link Copied!
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-primary" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Article Body Content (NO DUPLICATE BANNER - Only in-body text and elements rendered) */}
          <div className="py-2">
            <MarkdownRenderer content={blog.body} />
          </div>

          {/* Subtle Ornamental Divider */}
          <div className="flex items-center justify-center gap-3 py-6 text-primary/40 select-none">
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
          </div>

          {/* Author Card & Reader Footer */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/80 border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm ring-2 ring-primary/25 shrink-0">
                  {blog.author_name
                    ? blog.author_name.slice(0, 2).toUpperCase()
                    : "AU"}
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg text-on-surface">
                    Written by {blog.author_name || "Author"}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-body">
                    Published on Blogit · A quiet home for thoughtful writing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="btn-primary-warm px-4 py-2 text-xs self-start sm:self-center"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share this post</span>
              </button>
            </div>
          </div>

          {/* Slug Footer */}
          <div className="pt-6 flex items-center justify-between text-xs text-on-surface-variant font-mono">
            <Link href="/" className="hover:text-primary transition-colors">
              blogit.io
            </Link>
            <span>/{blog.slug}</span>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
