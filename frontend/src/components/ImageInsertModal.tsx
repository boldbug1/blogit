"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Link2, ImageIcon, Check, AlertCircle } from "lucide-react";

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

export function ImageInsertModal({
  isOpen,
  onClose,
  onInsert,
}: ImageInsertModalProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const compressImage = (file: File, maxWidth = 1600, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== "string") {
          resolve("");
          return;
        }
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Image size exceeds 15MB limit. Please choose a smaller file.");
      return;
    }

    setError(null);
    setFileName(file.name);
    if (!altText) {
      // Auto-populate alt text with clean file name
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setAltText(cleanName);
    }

    try {
      const optimizedDataUrl = await compressImage(file);
      if (optimizedDataUrl) {
        setUploadedDataUrl(optimizedDataUrl);
      } else {
        setError("Failed to process image.");
      }
    } catch {
      setError("Failed to read image file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "upload") {
      if (!uploadedDataUrl) {
        setError("Please select or drop an image file.");
        return;
      }
      onInsert(uploadedDataUrl, altText.trim() || fileName || "Uploaded image");
    } else {
      if (!imageUrl.trim()) {
        setError("Please enter a valid image URL.");
        return;
      }
      onInsert(imageUrl.trim(), altText.trim() || "Image");
    }

    handleClose();
  };

  const handleClose = () => {
    setImageUrl("");
    setAltText("");
    setUploadedDataUrl(null);
    setFileName("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-lg shadow-2xl border border-outline-variant/30 overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Insert Image
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="flex rounded-md bg-surface-container p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setTab("upload");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === "upload"
                  ? "bg-white shadow-sm text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("url");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === "url"
                  ? "bg-white shadow-sm text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === "upload" ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {uploadedDataUrl ? (
                <div className="relative rounded-md overflow-hidden border border-outline-variant/30 bg-surface-container-low max-h-56 group flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedDataUrl}
                    alt="Preview"
                    className="max-h-56 w-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary-warm text-xs px-3 py-1.5 bg-white/90"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedDataUrl(null);
                        setFileName("");
                      }}
                      className="btn-secondary-warm text-xs px-3 py-1.5 bg-white/90 text-error"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-on-surface">
                    Click to browse or drag and drop image
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    PNG, JPG, WebP, GIF or SVG (up to 8MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Image Web URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {imageUrl && (
                <div className="rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low max-h-44 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-40 w-auto object-contain rounded-md"
                    onError={() =>
                      setError("Could not load image from the provided URL.")
                    }
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Caption / Alt Description (optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Sunset over the Sahara dunes"
              className="w-full px-3.5 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary-warm px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={tab === "upload" ? !uploadedDataUrl : !imageUrl}
              className="btn-primary-warm px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
