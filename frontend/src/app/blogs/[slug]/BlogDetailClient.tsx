"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface BlogDetailClientProps {
  slug: string;
}

export default function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

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
          if (data?.title) {
            document.title = data.title;
          }
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

  // Zero re-render reading progress bar: updates DOM directly via RAF
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0 && progressBarRef.current) {
            const currentProgress = Math.min(
              100,
              Math.max(0, (window.scrollY / totalScroll) * 100)
            );
            progressBarRef.current.style.width = `${currentProgress}%`;
            progressBarRef.current.setAttribute(
              "aria-valuenow",
              String(Math.round(currentProgress))
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (typeof window !== "undefined" && blog) {
      const shareData = {
        title: blog.title,
        text: `Read "${blog.title}" on blogit`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return;
        }
      }

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

    // Instant optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    const newLiked = !previousLiked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setIsLiked(newLiked);
    setLikesCount(newCount);

    try {
      const res = await api.blogs.toggleLike(blog.id);
      setIsLiked(res.liked);
      setLikesCount(res.count);
    } catch (err) {
      console.error("Failed to toggle like", err);
      // Revert if network call failed
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
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
        ref={progressBarRef}
        className="fixed top-0 left-0 h-[2.5px] bg-primary z-[100] transition-[width] duration-75 ease-out pointer-events-none shadow-[0_1px_6px_rgba(0,0,0,0.15)]"
        style={{ width: "0%" }}
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
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

          {/* Unified Story Document Canvas */}
          <div className="bg-surface border border-outline-variant/40 shadow-xs rounded-lg overflow-hidden">
            {/* 1. Cover Banner (Fixed 16:9 Standard Format) */}
            {blog.banner_image && (
              <div className="w-full aspect-[16/9] bg-surface-container-low border-b border-outline-variant/40 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.banner_image}
                  alt={blog.title}
                  className="w-full h-full object-cover block"
                  loading="eager"
                />
              </div>
            )}

            {/* 2. Post Header Block */}
            <header className="p-6 sm:p-10 lg:p-12 pb-6 space-y-6">
              {/* Post Title */}
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface leading-[1.16] tracking-tight">
                {blog.title}
              </h1>

              {/* Post Description / Subtitle */}
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
                      className="px-3 py-1 rounded-md text-xs font-medium bg-surface-container-low text-secondary border border-outline-variant/40"
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
            <div className="border-t border-outline-variant/40" />

            {/* 3. Post Body */}
            <article className="p-6 sm:p-10 lg:p-12 pt-8">
              <MarkdownRenderer content={cleanBody} />
            </article>

            {/* 4. Bottom Interactive Action Bar */}
            <div className="px-6 sm:px-10 lg:px-12 py-3.5 border-t border-outline-variant/40 text-on-surface-variant text-xs flex items-center justify-between">
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

            {/* 5. Author Card / Editorial Footer */}
            <div className="p-6 sm:p-10 lg:p-12 border-t border-outline-variant/40 bg-surface-container-low">
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

        {/* Floating Mobile Action Pill (Sticky at bottom on phones for quick like/comment/share) */}
        <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/95 backdrop-blur-xl border border-outline-variant/60 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-6 text-xs text-on-surface transition-all">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              isLiked ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
            title={user ? "Like story" : "Sign in to like"}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 duration-150 ${
                isLiked ? "fill-primary text-primary" : ""
              }`}
            />
            <span>{likesCount}</span>
          </button>

          <div className="w-px h-3.5 bg-outline-variant/40" />

          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-1.5 font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            title="View responses"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentsCount}</span>
          </button>

          <div className="w-px h-3.5 bg-outline-variant/40" />

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 font-medium text-on-surface-variant hover:text-primary transition-colors"
            title="Share story"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-primary" />
            )}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
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