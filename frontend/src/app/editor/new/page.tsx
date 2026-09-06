"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WysiwygEditor } from "@/components/WysiwygEditor";
import { ImageInsertModal } from "@/components/ImageInsertModal";
import {
  ArrowLeft,
  Clock,
  Send,
  AlertCircle,
  ImageIcon,
  Tag,
  X,
  Plus,
} from "lucide-react";

const SUGGESTED_TAGS = [
  "Technology",
  "Writing",
  "Programming",
  "Design",
  "Life",
  "Productivity",
  "AI",
  "Science",
];

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading, router]);

  const wordCount = body
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Please provide a title and story content.");
      return;
    }

    setError(null);
    setIsPublishing(true);

    try {
      const fullBody = subtitle.trim()
        ? `*${subtitle.trim()}*\n\n${body.trim()}`
        : body.trim();

      const newBlog = await api.blogs.create({
        author_id: user?.id,
        title: title.trim(),
        body: fullBody,
        banner_image: bannerImage,
        tags: selectedTags,
      });

      router.push(`/blogs/${newBlog.slug}`);
    } catch (err: any) {
      setError(err.message || "Failed to publish post");
      setIsPublishing(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Sticky Top Action Bar */}
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-outline-variant/40" />

            {/* Edit / Full Preview Tab Switcher */}
            <div className="inline-flex rounded-lg bg-surface-container p-1 text-xs">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  !isPreviewMode
                    ? "bg-white shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  isPreviewMode
                    ? "bg-white shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-outline-variant/30 text-xs text-on-surface-variant font-mono">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                {wordCount} words · ~{readTimeMinutes} min
              </span>
            </div>

            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="btn-primary-warm px-5 py-2 text-xs sm:text-sm font-semibold disabled:opacity-60"
            >
              <span>{isPublishing ? "Publishing..." : "Publish"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3 text-xs sm:text-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cover Banner Section (Sharp & Connected, Medium style) */}
        {bannerImage ? (
          <div className="relative group w-full h-52 sm:h-72 rounded-lg overflow-hidden mb-6 border border-outline-variant/30 bg-surface-container-low shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImage}
              alt="Story banner"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end p-4 gap-2">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(true)}
                className="btn-secondary-warm text-xs px-3 py-1.5 bg-white/90"
              >
                Change banner
              </button>
              <button
                type="button"
                onClick={() => setBannerImage("")}
                className="btn-secondary-warm text-xs px-3 py-1.5 bg-white/90 text-error hover:text-error"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsBannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-black/5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add cover banner</span>
            </button>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface placeholder:text-outline-variant/40 focus:outline-none tracking-tight leading-tight"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle / Description (optional)"
            className="w-full bg-transparent font-body text-lg sm:text-xl text-on-surface-variant placeholder:text-outline-variant/35 focus:outline-none italic"
          />
        </div>

        {/* Tags Selector Section */}
        <div className="mb-6 p-4 rounded-lg bg-white/60 border border-outline-variant/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>Story Topics &amp; Tags</span>
          </div>

          {/* Selected Tags Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-primary-fixed text-on-primary-fixed"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Custom Tag Input */}
            <div className="inline-flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-md text-xs border border-outline-variant/30">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add custom tag..."
                className="bg-transparent text-xs outline-none text-on-surface placeholder:text-on-surface-variant/50 w-24 sm:w-28"
              />
              {tagInput && (
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="text-primary hover:text-primary/80"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Suggested Tags Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-on-surface-variant">
            <span className="text-secondary font-mono mr-1">Suggestions:</span>
            {SUGGESTED_TAGS.filter((t) => !selectedTags.includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleAddTag(t)}
                className="px-2 py-0.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content Area */}
        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary font-mono">
              Rendered Body Preview
            </div>
            {/* ONLY the body is in the white box */}
            <div className="bg-white border border-[#e4ddd2] shadow-xs p-6 sm:p-10 min-h-[500px] rounded-lg">
              <MarkdownRenderer content={body || "*No story content yet...*"} />
            </div>
          </div>
        ) : (
          <WysiwygEditor
            initialContent={body}
            onChange={(markdown) => setBody(markdown)}
          />
        )}
      </main>

      {/* Banner Upload / URL Modal */}
      <ImageInsertModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onInsert={(url) => {
          setBannerImage(url);
          setIsBannerModalOpen(false);
        }}
      />
    </div>
  );
}
