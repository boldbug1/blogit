"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, BlogDetail, extractPostDescription } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WysiwygEditor } from "@/components/WysiwygEditor";
import { ImageInsertModal } from "@/components/ImageInsertModal";
import {
  ArrowLeft,
  Clock,
  Send,
  Undo,
  CheckCircle2,
  AlertCircle,
  Eye,
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

export default function UpdatePostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [initialBlog, setInitialBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
      return;
    }

    if (id && user) {
      setIsLoading(true);
      api.blogs
        .getById(id)
        .then((detail) => {
          if (detail.author_id && user.id && detail.author_id !== user.id) {
            setIsUnauthorized(true);
            setError("You do not have permission to edit this story.");
            return;
          }
          const { description, body: cleanBody } = extractPostDescription(detail.body);
          setInitialBlog(detail);
          setTitle(detail.title);
          setSubtitle(description || "");
          setBody(cleanBody);
          setBannerImage(detail.banner_image || "");
          setSelectedTags(detail.tags || []);
        })
        .catch(async (err) => {
          try {
            const list = await api.blogs.list();
            const match = list.find((b) => b.id === id);
            if (match) {
              const detail = await api.blogs.getBySlug(match.slug);
              if (detail.author_id && user.id && detail.author_id !== user.id) {
                setIsUnauthorized(true);
                setError("You do not have permission to edit this story.");
                return;
              }
              const { description, body: cleanBody } = extractPostDescription(detail.body);
              setInitialBlog(detail);
              setTitle(detail.title);
              setSubtitle(description || "");
              setBody(cleanBody);
              setBannerImage(detail.banner_image || "");
              setSelectedTags(detail.tags || []);
              return;
            }
          } catch (fallbackErr) {
            // ignore fallback error
          }
          setError(err.message || "Failed to load story from database");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, user, isAuthLoading, router]);

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

  const handleUpdate = async () => {
    if (isUnauthorized || (initialBlog?.author_id && user?.id && initialBlog.author_id !== user.id)) {
      setError("You do not have permission to edit this story.");
      return;
    }

    if (!title.trim() && !body.trim()) {
      setError("Please provide at least a title or body.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const fullBody = subtitle.trim()
        ? `*${subtitle.trim()}*\n\n${body.trim()}`
        : body.trim();

      const updated = await api.blogs.update(id, {
        title: title.trim(),
        body: fullBody,
        banner_image: bannerImage,
        tags: selectedTags,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        if (updated.slug) {
          router.push(`/blogs/${updated.slug}`);
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update story in database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (initialBlog) {
      setTitle(initialBlog.title);
      setBody(initialBlog.body);
      setBannerImage(initialBlog.banner_image || "");
      setSelectedTags(initialBlog.tags || []);
    }
  };

  if (isAuthLoading || !user || isLoading) {
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

            {/* Write / Preview Tab Switcher */}
            <div className="inline-flex rounded-lg bg-surface-container p-1 text-xs">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  !isPreviewMode
                    ? "bg-surface shadow-xs text-on-surface font-semibold"
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
                    ? "bg-surface shadow-xs text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRevert}
              className="btn-secondary-warm px-3.5 py-1.5 text-xs font-medium"
              title="Revert changes to last saved version"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Revert</span>
            </button>

            <button
              type="button"
              disabled={isSaving || isUnauthorized}
              onClick={handleUpdate}
              className="btn-primary-warm px-5 py-2 text-xs sm:text-sm font-semibold disabled:opacity-60"
            >
              <span>{isSaving ? "Saving..." : "Save"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Post saved successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3 text-xs sm:text-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isUnauthorized ? (
          <div className="p-10 rounded-lg bg-surface border border-outline-variant/40 text-center space-y-4 my-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-headline text-on-surface">
              Access Restricted
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              You do not have permission to edit this story. You can only edit stories that you authored.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="btn-primary-warm text-xs sm:text-sm inline-flex">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Clean Telemetry Strip */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant pb-3 mb-6 border-b border-outline-variant/30 font-mono">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>~{readTimeMinutes} min read</span>
          </div>
          {initialBlog && (
            <Link
              href={`/blogs/${initialBlog.slug}`}
              className="text-primary hover:underline flex items-center gap-1 font-sans"
            >
              <span>View Post</span>
              <Eye className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

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
                className="btn-secondary-warm text-xs px-3 py-1.5 bg-surface/90"
              >
                Change banner
              </button>
              <button
                type="button"
                onClick={() => setBannerImage("")}
                className="btn-secondary-warm text-xs px-3 py-1.5 bg-surface/90 text-error hover:text-error"
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
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
        <div className="mb-6 p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-2.5">
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
            <div className="bg-surface border border-outline-variant/40 shadow-xs p-6 sm:p-10 min-h-[500px] rounded-lg">
              <MarkdownRenderer content={body || "*No story content yet...*"} />
            </div>
          </div>
        ) : (
          <WysiwygEditor
            initialContent={body}
            onChange={(markdown) => setBody(markdown)}
          />
        )}
      </>
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
