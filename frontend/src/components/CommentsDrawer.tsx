"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, MessageSquare, CornerDownRight, Send, Loader2 } from "lucide-react";
import { api, BlogComment, formatUtcDate } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blogId: string;
  onCommentCountChange?: (newCount: number) => void;
}

export function CommentsDrawer({
  isOpen,
  onClose,
  blogId,
  onCommentCountChange,
}: CommentsDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    if (isOpen && blogId) {
      setIsLoading(true);
      api.blogs
        .listComments(blogId)
        .then((data) => {
          setComments(data);
          onCommentCountChange?.(data.length);
        })
        .catch((err) => {
          console.error("Failed to load comments:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, blogId, onCommentCountChange]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await api.blogs.createComment(blogId, {
        content: newComment.trim(),
      });
      const updated = [...comments, created];
      setComments(updated);
      setNewComment("");
      onCommentCountChange?.(updated.length);
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const created = await api.blogs.createComment(blogId, {
        content: replyContent.trim(),
        parent_id: parentId,
      });
      const updated = [...comments, created];
      setComments(updated);
      setReplyContent("");
      setReplyingToId(null);
      onCommentCountChange?.(updated.length);
    } catch (err: any) {
      alert(err.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (!isOpen) return null;

  // Group top-level and replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce<Record<string, BlogComment[]>>(
    (acc, c) => {
      if (c.parent_id) {
        if (!acc[c.parent_id]) acc[c.parent_id] = [];
        acc[c.parent_id].push(c);
      }
      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-surface h-full shadow-2xl border-l border-outline-variant/30 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 font-headline font-bold text-lg text-on-surface">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Responses ({comments.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/5 transition-colors"
            aria-label="Close responses"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Post Comment Input */}
          {user ? (
            <form
              onSubmit={handleSubmitComment}
              className="p-4 rounded-lg bg-white/90 border border-outline-variant/30 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-on-surface">
                  {user.name}
                </span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/20">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="btn-primary-warm px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Respond</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-lg bg-white/70 border border-outline-variant/30 text-center space-y-2">
              <p className="text-xs text-on-surface-variant">
                Sign in to join the conversation and reply to responses.
              </p>
              <Link href="/login" className="btn-secondary-warm text-xs px-4 py-1.5 inline-block">
                Sign in
              </Link>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : topLevel.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant space-y-2">
              <p className="text-sm font-headline italic">No responses yet.</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {topLevel.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg bg-white/80 border border-outline-variant/30 shadow-xs space-y-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {comment.author_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-on-surface">
                          {comment.author_name}
                        </div>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          {formatUtcDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-on-surface font-body leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Actions & Reply Button */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToId(
                          replyingToId === comment.id ? null : comment.id
                        )
                      }
                      className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-medium text-[11px]"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Inline Reply Input */}
                  {replyingToId === comment.id && (
                    <div className="pt-2 pl-2 space-y-2 border-l-2 border-primary/30">
                      {user ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.author_name}...`}
                            rows={2}
                            className="w-full p-2.5 rounded-md bg-surface-container-low text-xs text-on-surface outline-none border border-outline-variant/30 focus:border-primary/50 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyContent("");
                              }}
                              className="text-xs text-on-surface-variant hover:text-on-surface px-3 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={
                                isSubmittingReply || !replyContent.trim()
                              }
                              onClick={() => handleSubmitReply(comment.id)}
                              className="btn-primary-warm px-3 py-1 text-xs disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-on-surface-variant">
                          <Link href="/login" className="text-primary underline">
                            Sign in
                          </Link>{" "}
                          to reply.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Threaded Nested Replies */}
                  {repliesByParent[comment.id]?.length > 0 && (
                    <div className="space-y-2.5 pt-2 pl-3 border-l-2 border-outline-variant/40">
                      {repliesByParent[comment.id].map((reply) => (
                        <div
                          key={reply.id}
                          className="p-3 rounded-md bg-surface-container-low/70 border border-outline-variant/20 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                              {reply.author_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-semibold text-on-surface">
                              {reply.author_name}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              · {formatUtcDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface font-body leading-relaxed whitespace-pre-wrap pl-7">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
