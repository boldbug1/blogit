"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { ImageInsertModal } from "@/components/ImageInsertModal";
import {
  Bold,
  Italic,
  Quote,
  Code,
  List,
  ListOrdered,
  Minus,
  Link2,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";

interface WysiwygEditorProps {
  initialContent?: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({
  initialContent = "",
  onChange,
  placeholder = "Write your story here... Experience live formatting, drag-and-drop images, or use the toolbar above.",
}: WysiwygEditorProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-[#2c2420] text-[#f5ede4] p-4 rounded-xl font-mono text-sm overflow-x-auto my-6",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-primary bg-surface-container-low/40 p-4 rounded-r-xl italic my-6 text-on-surface",
          },
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline font-medium hover:text-primary/80 transition-colors",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto border border-outline-variant/30 my-6 shadow-sm",
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Extract clean markdown content
      const markdown = (editor.storage as any).markdown?.getMarkdown?.() || editor.getHTML();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[460px] outline-none font-body text-base sm:text-lg leading-relaxed text-on-surface focus:outline-none focus:ring-0 [&_h2]:font-headline [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-on-surface [&_h3]:font-headline [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-on-surface [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1 [&_code]:bg-[#efe7db] [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-sm [&_hr]:border-outline-variant/40 [&_hr]:my-8",
      },
    },
  });

  // Update editor content if initialContent changes after mounting (e.g. data loaded from API)
  useEffect(() => {
    if (editor && initialContent) {
      const currentMarkdown = (editor.storage as any).markdown?.getMarkdown?.() || "";
      if (currentMarkdown.trim() !== initialContent.trim() && !editor.isFocused) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="w-full h-96 bg-white/95 rounded-2xl border border-outline-variant/30 animate-pulse flex items-center justify-center text-sm text-on-surface-variant">
        Loading editor...
      </div>
    );
  }

  const handleInsertImage = (url: string, alt: string) => {
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim() })
        .run();
    }
    setIsLinkPromptOpen(false);
    setLinkUrl("");
  };

  const openLinkPrompt = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setIsLinkPromptOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Docked Formatting Toolbar directly above body box */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-outline-variant/30 shadow-xs">
        <div className="flex flex-wrap items-center gap-1 text-on-surface">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all text-xs font-bold ${
              editor.isActive("bold")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Bold (Ctrl+B) - Formats selected text"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all text-xs italic ${
              editor.isActive("italic")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Italic (Ctrl+I) - Formats selected text"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-outline-variant/40 mx-1" />

          {/* H2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2.5 py-1.5 rounded-lg transition-all text-xs font-bold font-mono ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Heading 2 - Formats selected text"
          >
            H2
          </button>

          {/* H3 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold font-mono ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Heading 3 - Formats selected text"
          >
            H3
          </button>

          <div className="w-px h-4 bg-outline-variant/40 mx-1" />

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("blockquote")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Quote - Formats selected text"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("code")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Inline Code - Formats selected text"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1.5 rounded-lg transition-all text-xs font-mono font-medium ${
              editor.isActive("codeBlock")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Code Block"
          >
            {"{ }"}
          </button>

          <div className="w-px h-4 bg-outline-variant/40 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("bulletList")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("orderedList")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Link */}
          <button
            type="button"
            onClick={openLinkPrompt}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("link")
                ? "bg-primary text-white shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
            title="Insert or Edit Link on selected text"
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Image Upload / URL */}
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-container transition-all text-on-surface"
            title="Insert Image (Upload or Web URL)"
          >
            <ImageIcon className="w-4 h-4 text-primary" />
          </button>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded-lg hover:bg-surface-container transition-all text-on-surface"
            title="Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-all text-on-surface disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-all text-on-surface disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Link Popover Prompt */}
      {isLinkPromptOpen && (
        <form
          onSubmit={handleApplyLink}
          className="p-3 rounded-xl bg-white border border-outline-variant/40 shadow-md flex items-center gap-2 text-xs"
        >
          <Link2 className="w-4 h-4 text-primary shrink-0" />
          <input
            type="url"
            value={linkUrl}
            autoFocus
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste URL (e.g. https://example.com)..."
            className="flex-1 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="btn-primary-warm px-3 py-1.5 text-xs font-semibold"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setIsLinkPromptOpen(false)}
            className="btn-secondary-warm px-2.5 py-1.5 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* ONLY Body is in the White Box! */}
      <div className="bg-white/95 rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-10 min-h-[500px] transition-all focus-within:border-primary/40 focus-within:shadow-md cursor-text"
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Image Upload / URL Modal */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
      />
    </div>
  );
}
