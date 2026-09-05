"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, BlogDetail } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WysiwygEditor } from "@/components/WysiwygEditor";
import {
  ArrowLeft,
  Clock,
  Send,
  Undo,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function UpdatePostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [initialBlog, setInitialBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
      return;
    }

    if (id) {
      api.blogs
        .list()
        .then(async (list) => {
          const match = list.find((b) => b.id === id);
          if (match) {
            const detail = await api.blogs.getBySlug(match.slug);
            setInitialBlog(detail);
            setTitle(detail.title);
            setBody(detail.body);
          } else {
            setError("Post not found.");
          }
        })
        .catch((err) => {
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

  const handleUpdate = async () => {
    if (!title.trim() && !body.trim()) {
      setError("Please provide at least a title or body.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.blogs.update(id, {
        title: title.trim(),
        body: body.trim(),
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
    }
  };

  if (isAuthLoading || isLoading) {
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

            {/* Write / Preview Tab Switcher */}
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
              disabled={isSaving}
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
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Post saved successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-xs sm:text-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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

        {/* Title: floating on warm background above toolbar and body */}
        <div className="space-y-3 mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface placeholder:text-outline-variant/40 focus:outline-none tracking-tight leading-tight"
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
