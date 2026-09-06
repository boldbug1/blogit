"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/components/LandingPage";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  BlogSummary,
  formatUtcDate,
  extractCoverImage,
  extractExcerpt,
} from "@/lib/api";
import {
  Heart,
  MessageSquare,
  Clock,
  Tag,
  X,
  ArrowRight,
  SquarePen,
  BookOpen,
} from "lucide-react";

const DEFAULT_TOPICS = [
  "Technology",
  "Writing",
  "Programming",
  "Design",
  "Life",
  "Productivity",
  "AI",
  "Science",
];

function FeedContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Sync search from URL query parameter
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  // Listen to immediate custom search event from Navbar
  useEffect(() => {
    const handleSearchEvent = (e: any) => {
      if (typeof e.detail === "string") {
        setSearchQuery(e.detail);
      }
    };
    window.addEventListener("blogit-search", handleSearchEvent);
    return () => window.removeEventListener("blogit-search", handleSearchEvent);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      api.blogs.list(selectedTag || undefined),
      api.blogs.listTags().catch(() => []),
    ])
      .then(([blogsData, tagsData]) => {
        if (!isMounted) return;
        setBlogs(Array.isArray(blogsData) ? blogsData : []);

        // Combine DB tags with default topics for rich discovery
        const mergedTags = Array.from(
          new Set([...(tagsData || []), ...DEFAULT_TOPICS])
        );
        setTags(mergedTags);
      })
      .catch((err) => {
        console.error("Failed to load feed data:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTag]);

  // Client-side search filtering
  const filteredBlogs = useMemo(() => {
    let list = [...blogs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.body && b.body.toLowerCase().includes(q)) ||
          (b.author_name && b.author_name.toLowerCase().includes(q)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [blogs, searchQuery]);

  // Staff picks: take top 3 stories
  const staffPicks = useMemo(() => {
    return [...blogs].slice(0, 3);
  }, [blogs]);

  const clearSearch = () => {
    setSearchQuery("");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("blogit-search", { detail: "" }));
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      {/* Main 2-Column Responsive Layout (Medium Style) */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-14 items-start">
        {/* Left / Center: Main Story Feed */}
        <div className="flex-1 min-w-0 w-full max-w-3xl">
          {/* Feed Header */}
          <div className="border-b border-outline-variant/30 pb-3 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="font-semibold text-on-surface pb-2 border-b-2 border-primary tracking-tight">
                For you
              </span>
            </div>

            {/* Search Query indicator if filtering */}
            {searchQuery && (
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/30">
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-primary hover:text-primary/80 font-sans ml-1"
                  title="Clear search filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-surface-container-low/60 border border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">
                Filtering by topic:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                <Tag className="w-3 h-3 text-primary" />
                <span>{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-primary ml-0.5"
                  title="Clear topic filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

              {/* Story Feed Cards List */}
              {isLoading ? (
                <div className="divide-y divide-outline-variant/20">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="py-7 animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-outline-variant/30" />
                        <div className="w-24 h-3 bg-outline-variant/30 rounded" />
                      </div>
                      <div className="flex justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="w-3/4 h-5 bg-outline-variant/30 rounded" />
                          <div className="w-full h-3 bg-outline-variant/20 rounded" />
                        </div>
                        <div className="w-28 h-20 bg-outline-variant/30 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-20 px-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">
                    No stories found
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">
                    {searchQuery || selectedTag
                      ? "No stories match your current search or topic filter."
                      : "Be the first to publish a dispatch to Blogit."}
                  </p>
                  {(searchQuery || selectedTag) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTag(null);
                      }}
                      className="btn-secondary-warm text-xs px-4 py-2"
                    >
                      Reset filters
                    </button>
                  )}
                  {!searchQuery && !selectedTag && (
                    <Link
                      href={user ? "/editor/new" : "/login"}
                      className="btn-primary-warm text-xs px-5 py-2 inline-flex items-center gap-1.5"
                    >
                      <SquarePen className="w-4 h-4" />
                      <span>Write a story</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/25">
                  {filteredBlogs.map((blog) => {
                    const blogBody = blog.body || "";
                    const wordCount = blogBody
                      .trim()
                      .split(/\s+/)
                      .filter((w) => w.length > 0).length;
                    const readTime = Math.max(1, Math.ceil(wordCount / 200));
                    const dateStr = formatUtcDate(blog.created_at);
                    const thumbnail =
                      blog.banner_image || extractCoverImage(blogBody);
                    const excerpt = extractExcerpt(blogBody, 160);

                    return (
                      <article
                        key={blog.id}
                        className="py-7 group transition-colors"
                      >
                        {/* Byline row (Author avatar, Name, Date) */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] ring-1 ring-primary/20">
                            {blog.author_name
                              ? blog.author_name.slice(0, 2).toUpperCase()
                              : "AU"}
                          </div>
                          <span className="text-xs font-semibold text-on-surface">
                            {blog.author_name || "Author"}
                          </span>
                          <span className="text-xs text-on-surface-variant/60">
                            ·
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {dateStr}
                          </span>
                        </div>

                        {/* Story Content Grid */}
                        <div className="flex items-start justify-between gap-4 sm:gap-6">
                          {/* Text Side (Headline + Excerpt + Action Row) */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="block group/link"
                            >
                              <h2 className="font-headline text-xl sm:text-2xl lg:text-[26px] font-extrabold text-on-surface group-hover/link:text-primary transition-colors leading-tight tracking-tight line-clamp-2 mb-2">
                                {blog.title}
                              </h2>
                              {excerpt && (
                                <p className="font-body text-sm sm:text-base text-on-surface-variant/80 font-normal line-clamp-2 leading-relaxed">
                                  {excerpt}
                                </p>
                              )}
                            </Link>

                            {/* Bottom Action & Metadata Row */}
                            <div className="flex items-center justify-between gap-3 mt-4 text-xs text-on-surface-variant">
                              <div className="flex items-center gap-3 flex-wrap">
                                {/* Read time */}
                                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                  <Clock className="w-3 h-3 text-primary" />
                                  {readTime} min read
                                </span>

                                {/* Story Tags Pills */}
                                {blog.tags && blog.tags.length > 0 && (
                                  <div className="hidden sm:flex items-center gap-1.5">
                                    {blog.tags.slice(0, 2).map((tag) => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setSelectedTag(tag)}
                                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-low text-secondary hover:text-primary hover:bg-primary/10 transition-colors border border-outline-variant/30"
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Likes & Comments Counters (Medium Style) */}
                              <div className="flex items-center gap-4 text-xs">
                                <Link
                                  href={`/blogs/${blog.slug}`}
                                  className="flex items-center gap-1 hover:text-primary transition-colors"
                                  title="Likes"
                                >
                                  <Heart className="w-3.5 h-3.5" />
                                  <span>{blog.likes_count || 0}</span>
                                </Link>

                                <Link
                                  href={`/blogs/${blog.slug}`}
                                  className="flex items-center gap-1 hover:text-primary transition-colors"
                                  title="Responses"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{blog.comments_count || 0}</span>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Thumbnail (Uncropped / Natural Aspect Ratio Container) */}
                          {thumbnail && (
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="w-24 h-18 sm:w-36 sm:h-24 md:w-44 md:h-28 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 bg-surface-container-low block group/img shadow-xs hover:shadow-md transition-shadow"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              />
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Sidebar (Medium Style) */}
            <aside className="hidden lg:block w-80 shrink-0 space-y-8 pl-10 border-l border-outline-variant/25">
              {/* Staff Picks Section */}
              {staffPicks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-headline text-base font-bold text-on-surface tracking-tight">
                    Recommended
                  </h3>
                  <div className="space-y-4">
                    {staffPicks.map((pick) => (
                      <article key={pick.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[8px]">
                            {pick.author_name
                              ? pick.author_name.slice(0, 2).toUpperCase()
                              : "AU"}
                          </div>
                          <span className="text-[11px] font-semibold text-on-surface truncate">
                            {pick.author_name || "Author"}
                          </span>
                        </div>
                        <Link
                          href={`/blogs/${pick.slug}`}
                          className="font-headline text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-2 leading-snug block"
                        >
                          {pick.title}
                        </Link>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          {formatUtcDate(pick.created_at)}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Topics Section (Medium Style) */}
              <div className="space-y-3 pt-2">
                <h3 className="font-headline text-base font-bold text-on-surface tracking-tight">
                  Recommended topics
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {tags.map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setSelectedTag(isActive ? null : tag)
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-xs font-semibold"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-primary hover:underline font-medium pt-1 block"
                  >
                    Clear topic filter
                  </button>
                )}
              </div>

              {/* Writing Callout Card */}
              <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-low border border-outline-variant/30 space-y-3 shadow-xs">
                <h4 className="font-headline font-bold text-sm text-on-surface">
                  Writing on Blogit
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Share your expertise, stories, and ideas. Write without
                  distractions and connect with thoughtful readers.
                </p>
                <Link
                  href={user ? "/editor/new" : "/signup"}
                  className="btn-primary-warm text-xs px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <span>Start writing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Minimal Editorial Footer */}
              <div className="pt-4 border-t border-outline-variant/20 text-[11px] text-on-surface-variant/70 space-y-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <Link href="/" className="hover:text-primary transition-colors">
                    Help
                  </Link>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Status
                  </Link>
                  <Link href="/" className="hover:text-primary transition-colors">
                    About
                  </Link>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Terms
                  </Link>
                </div>
                <p>© 2026 Blogit. All rights reserved.</p>
              </div>
            </aside>
          </div>
        </div>
    );
  }

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <Navbar />
        <main className="w-full pt-28 pb-20 flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <main className="w-full pt-24 pb-20 flex-1">
        <Suspense fallback={null}>
          <FeedContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

