"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WysiwygEditor } from "@/components/WysiwygEditor";
import {
  ArrowLeft,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
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
      });

      router.push(`/blogs/${newBlog.slug}`);
    } catch (err: any) {
      setError(err.message || "Failed to publish post");
      setIsPublishing(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5ee]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf5ee] text-on-surface">
      {/* Sticky Top Action Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#faf5ee]/95 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
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
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-xs sm:text-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title & Description: floating on warm background above toolbar and body */}
        <div className="space-y-3 mb-8">
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

        {/* Body Content Area */}
        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary font-mono">
              Rendered Body Preview
            </div>
            {/* ONLY the body is in the white box */}
            <div className="bg-white/95 rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-10 min-h-[500px]">
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
    </div>
  );
}
