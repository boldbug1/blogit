"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSkeleton } from "@/components/Skeleton";
import { ContributionStreak } from "@/components/ContributionStreak";
import { useAuth } from "@/context/AuthContext";
import { api, BlogSummary, formatUtcDate, extractCoverImage, extractExcerpt } from "@/lib/api";
import {
  PenSquare,
  BookOpen,
  TrendingUp,
  Clock,
  Plus,
  BarChart3,
  Eye,
  ImageIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Share2,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [blogToDelete, setBlogToDelete] = useState<BlogSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.blogs.delete(blogToDelete.id);
      setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
      setBlogToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stitch Analytics Controls
  const [activeMetric, setActiveMetric] = useState<"views" | "visitors" | "subscribers">("views");
  const [activeRange, setActiveRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user?.id) {
      setIsLoadingBlogs(true);
      api.blogs
        .list({ author_id: user.id })
        .then((data) => {
          if (Array.isArray(data)) {
            setBlogs(data);
          } else {
            setBlogs([]);
          }
        })
        .catch((err) => {
          console.error("Failed to load stories from DB:", err);
          setBlogs([]);
        })
        .finally(() => {
          setIsLoadingBlogs(false);
        });
    }
  }, [user, isAuthLoading, router]);

  const handleCopyLink = (slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/blogs/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <Navbar />
        <main className="w-full flex-1">
          <DashboardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const totalStories = blogs.length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-28 pb-24 flex-1">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl text-on-surface font-bold tracking-tight">
                Welcome, {user?.name || "Writer"}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {user?.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/editor/new"
                className="btn-primary-warm text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </Link>
            </div>
          </div>

          {/* Real Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-surface border border-outline-variant/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold font-body text-secondary">
                  Published Posts
                </span>
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline text-3xl sm:text-4xl text-on-surface font-bold">
                {totalStories}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                {totalStories === 1
                  ? "1 post published"
                  : `${totalStories} posts published`}
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-outline-variant/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold font-body text-secondary">
                  Total Views
                </span>
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline text-3xl sm:text-4xl text-on-surface font-bold text-on-surface-variant/80">
                —
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                No view data yet
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-outline-variant/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold font-body text-secondary">
                  Subscribers
                </span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline text-3xl sm:text-4xl text-on-surface font-bold text-on-surface-variant/80">
                —
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                No subscriber data yet
              </p>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="p-6 sm:p-7 rounded-lg bg-surface border border-outline-variant/40 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl text-on-surface font-bold tracking-tight">
                  Analytics
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Views &amp; readership metrics
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Metric Selectors */}
                <div className="inline-flex rounded-md bg-surface-container p-1 text-xs">
                  {(["views", "visitors", "subscribers"] as const).map((metric) => (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => setActiveMetric(metric)}
                      className={`capitalize px-3 py-1.5 rounded-sm font-medium transition-all ${
                        activeMetric === metric
                          ? "bg-surface shadow-sm text-on-surface font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {metric}
                    </button>
                  ))}
                </div>

                {/* Range Selectors */}
                <div className="inline-flex rounded-md bg-surface-container p-1 text-xs">
                  {(["7D", "30D", "90D", "1Y"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setActiveRange(range)}
                      className={`px-2.5 py-1.5 rounded-sm font-medium transition-colors ${
                        activeRange === range
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean empty state for metrics until views exist */}
            <div className="w-full h-48 rounded-lg bg-surface-container-low/40 border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface">
                No analytics data yet
              </h3>
            </div>
          </div>

          {/* GitHub-like Contribution Streak Heatmap */}
          <ContributionStreak blogs={blogs} />

          {/* Posts List from Real Database */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h2 className="font-headline text-2xl text-on-surface font-bold tracking-tight">
                Your Posts
              </h2>
              <span className="text-xs text-on-surface-variant font-mono">
                {totalStories} {totalStories === 1 ? "post" : "posts"}
              </span>
            </div>

            {isLoadingBlogs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-between gap-6 animate-pulse"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="h-4 w-32 bg-surface-container-high rounded" />
                      <div className="h-6 w-3/4 bg-surface-container-high rounded-md" />
                      <div className="h-3.5 w-1/2 bg-surface-container-high rounded" />
                    </div>
                    <div className="h-20 w-24 bg-surface-container-high rounded-md hidden sm:block shrink-0" />
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-16 rounded-lg bg-surface border border-dashed border-outline-variant/60 text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <PenSquare className="w-7 h-7" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-on-surface">
                  You haven&apos;t written any posts yet
                </h3>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Your space is quiet and ready. Start drafting your first post.
                </p>
                <div className="pt-2">
                  <Link
                    href="/editor/new"
                    className="btn-primary-warm text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write your first post</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog, idx) => {
                  const uniqueKey = blog.id ? String(blog.id) : (blog.slug || `story-${idx}`);
                  const dateStr = formatUtcDate(blog.created_at);
                  const coverImage = blog.body ? extractCoverImage(blog.body) : null;
                  const excerpt = blog.body ? extractExcerpt(blog.body, 140) : "";
                  const wordCount = blog.body ? blog.body.trim().split(/\s+/).length : 0;
                  const readTime = Math.max(1, Math.ceil(wordCount / 200));

                  return (
                    <div
                      key={uniqueKey}
                      className="p-6 rounded-lg bg-surface hover:bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0 flex-1">
                        {coverImage && (
                          <Link
                            href={`/blogs/${blog.slug}`}
                            className="w-full sm:w-40 h-28 rounded-md overflow-hidden shrink-0 border border-outline-variant/30 bg-surface-container-low block group/img shadow-2xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverImage}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </Link>
                        )}

                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              Published
                            </span>
                            <span className="text-on-surface-variant font-mono">
                              {dateStr}
                            </span>
                            <span className="text-on-surface-variant">·</span>
                            <span className="text-on-surface-variant font-mono">
                              By {blog.author_name || user?.name || "You"}
                            </span>
                            <span className="text-on-surface-variant">·</span>
                            <span className="inline-flex items-center gap-1 text-on-surface-variant font-mono">
                              <Clock className="w-3 h-3" />
                              {readTime} min read
                            </span>
                          </div>

                          <h3 className="font-headline text-xl sm:text-2xl text-on-surface group-hover:text-primary transition-colors font-bold tracking-tight leading-snug">
                            <Link href={`/blogs/${blog.slug}`} className="hover:underline">
                              {blog.title}
                            </Link>
                          </h3>

                          {excerpt && (
                            <Link href={`/blogs/${blog.slug}`} className="block">
                              <p className="text-sm text-on-surface-variant font-body line-clamp-2 leading-relaxed hover:text-on-surface transition-colors">
                                {excerpt}
                              </p>
                            </Link>
                          )}

                          <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-1 font-mono">
                            <span className="text-secondary truncate">
                              /{blog.slug}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(blog.slug)}
                          className="p-2.5 rounded-lg border border-outline-variant/40 bg-surface hover:bg-surface-container-low hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
                          title="Copy story link"
                          aria-label={`Copy link for ${blog.title}`}
                        >
                          {copiedSlug === blog.slug ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4 text-on-surface-variant hover:text-primary transition-colors" />
                          )}
                        </button>
                        <Link
                          href={`/editor/${blog.id}`}
                          className="p-2.5 rounded-lg border border-outline-variant/40 bg-surface hover:bg-surface-container-low hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all shadow-2xs flex items-center justify-center shrink-0 group/edit"
                          title="Edit story"
                          aria-label={`Edit ${blog.title}`}
                        >
                          <Pencil className="w-4 h-4 text-on-surface-variant group-hover/edit:text-primary transition-colors" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setBlogToDelete(blog);
                          }}
                          className="p-2.5 rounded-lg border border-outline-variant/40 bg-surface hover:bg-error/10 hover:border-error/40 text-on-surface-variant hover:text-error transition-all shadow-2xs flex items-center justify-center shrink-0 group/trash cursor-pointer"
                          title="Delete story"
                          aria-label={`Delete ${blog.title}`}
                        >
                          <Trash2 className="w-4 h-4 text-on-surface-variant group-hover/trash:text-error transition-colors" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {blogToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-surface border border-outline-variant/40 rounded-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-headline font-bold text-on-surface">
                    Delete story?
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold text-on-surface">
                      &quot;{blogToDelete.title}&quot;
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20 text-xs text-error">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    if (!isDeleting) setBlogToDelete(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-md border border-outline-variant/40 bg-surface hover:bg-surface-container text-on-surface transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-error text-white hover:bg-error/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? "Deleting..." : "Delete Story"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
