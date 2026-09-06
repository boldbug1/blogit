"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PostDetailSkeleton } from "@/components/Skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentsDrawer } from "@/components/CommentsDrawer";
import { useAuth } from "@/context/AuthContext";
import { api, BlogDetail, formatUtcDate, extractPostDescription } from "@/lib/api";
import {
  ArrowLeft,
  Share2,
  Check,
  Clock,
  Heart,
  MessageSquare,
} from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Likes and Comments
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      setError(null);
      api.blogs
        .getBySlug(slug)
        .then((data) => {
          setBlog(data);
          setLikesCount(data.likes_count || 0);
          setCommentsCount(data.comments_count || 0);
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

  // Check if current authenticated user liked this post
  useEffect(() => {
    if (blog && user) {
      api.blogs
        .getLikes(blog.id)
        .then((res) => setIsLiked(res.liked))
        .catch(() => setIsLiked(false));
    } else {
      setIsLiked(false);
    }
  }, [blog, user]);

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

  const handleToggleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!blog) return;

    try {
      const res = await api.blogs.toggleLike(blog.id);
      setIsLiked(res.liked);
      setLikesCount(res.count);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
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
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center max-w-md mx-auto">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mb-3">
            Story Not Found
          </h1>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            The dispatch you are looking for is not in the database or may have
            been updated.
          </p>
          <Link href="/" className="btn-primary-warm text-xs">
            Back to Stories
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { description: postDescription, body: cleanBody } = extractPostDescription(blog.body);
  const wordCount = (blog.body || "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const dateStr = formatUtcDate(blog.created_at);

  return (
    <div className="min-h-screen flex flex-col bg-background relative text-on-surface">
      {/* Minimalist Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 w-full h-[2.5px] bg-outline-variant/30 z-[99] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-primary z-[100] transition-[width] duration-150 ease-out pointer-events-none shadow-[0_1px_6px_rgba(0,0,0,0.15)]"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {readingProgress > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
        )}
      </div>

      <Navbar />

      <main className="w-full pt-28 pb-24 flex-1">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between mb-4">
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

          {/* Unified Story Document Canvas (Connected White Sheet with Soft-Sharp Boundaries) */}
          <div className="bg-white border border-[#e4ddd2] shadow-xs rounded-lg overflow-hidden">
            {/* 1. Cover Banner (Above post title, connected directly to post) */}
            {blog.banner_image && (
              <div className="w-full bg-[#f6f0e8] border-b border-[#e4ddd2] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.banner_image}
                  alt={blog.title}
                  className="w-full h-auto max-h-[540px] object-contain block mx-auto"
                />
              </div>
            )}

            {/* 2. Post Header Block (Inside white sheet, connecting directly with body) */}
            <header className="p-6 sm:p-10 lg:p-12 pb-6 space-y-6">

              {/* Post Title */}
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface leading-[1.16] tracking-tight">
                {blog.title}
              </h1>

              {/* Post Description / Subtitle (Moved below title instead of inside body) */}
              {postDescription && (
                <p className="font-body text-lg sm:text-xl text-on-surface-variant leading-relaxed italic">
                  {postDescription}
                </p>
              )}

              {/* Tags Pills */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-[#f6f0e8] text-secondary border border-outline-variant/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Author Byline Bar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs ring-1 ring-primary/25">
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
                    className="btn-secondary-warm px-3.5 py-1.5 text-xs flex items-center gap-1.5 rounded-md"
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

              {/* Top Interactive Action Bar */}
              <div className="flex items-center justify-between py-3 border-y border-outline-variant/30 text-on-surface-variant text-xs">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      isLiked ? "text-primary" : "hover:text-on-surface"
                    }`}
                    title={user ? "Like story" : "Sign in to like"}
                    >
                    <Heart
                      className={`w-4 h-4 transition-transform active:scale-125 ${
                        isLiked ? "fill-primary text-primary" : ""
                      }`}
                      />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCommentsOpen(true)}
                    className="flex items-center gap-1.5 font-medium hover:text-on-surface transition-colors"
                    title="View responses"
                    >
                    <MessageSquare className="w-4 h-4" />
                    <span>{commentsCount}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-on-surface-variant/70">
                  blogit dispatch
                </div>
              </div>
            </header>

            {/* Subtle Divider Connecting Header and Body Directly */}
            <div className="border-t border-[#e4ddd2]/80" />

            {/* 3. Post Body (No gap, no rounded corners, flows seamlessly in the white document) */}
            <article className="p-6 sm:p-10 lg:p-12 pt-8">
              <MarkdownRenderer content={cleanBody} />
            </article>

            {/* 4. Bottom Interactive Action Bar */}
            <div className="px-6 sm:px-10 lg:px-12 py-3.5 border-t border-[#e4ddd2]/80 text-on-surface-variant text-xs flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isLiked ? "text-primary" : "hover:text-on-surface"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      isLiked ? "fill-primary text-primary" : ""
                    }`}
                  />
                  <span>{likesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(true)}
                  className="flex items-center gap-1.5 font-medium hover:text-on-surface transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{commentsCount} responses</span>
                </button>
              </div>

             
            </div>

            {/* 5. Author Card / Editorial Footer within document */}
            <div className="p-6 sm:p-10 lg:p-12 border-t border-[#e4ddd2]/60 bg-[#faf6f0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm ring-1 ring-primary/25 shrink-0">
                    {blog.author_name
                      ? blog.author_name.slice(0, 2).toUpperCase()
                      : "AU"}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg text-on-surface">
                      Written by {blog.author_name || "Author"}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">
                      Published on Blogit · A quiet home for thoughtful writing
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-primary-warm px-4 py-2 text-xs self-start sm:self-center rounded-none"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share this post</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slug Footer */}
          <div className="pt-4 flex items-center justify-between text-xs text-on-surface-variant font-mono">
            <Link href="/" className="hover:text-primary transition-colors">
              blogit.io
            </Link>
            <span>/{blog.slug}</span>
          </div>
        </div>
      </main>

      {/* Slide-over Comments & Responses Drawer */}
      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        blogId={blog.id}
        onCommentCountChange={(count) => setCommentsCount(count)}
      />

      <Footer />
    </div>
  );
}
