"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Link2, ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
  aspectRatio?: "16:9" | "free";
  title?: string;
}

export function ImageInsertModal({
  isOpen,
  onClose,
  onInsert,
  aspectRatio = "16:9",
  title = "Insert Image",
}: ImageInsertModalProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const is16x9 = aspectRatio === "16:9";

  const processAndCropImage = (
    file: File
  ): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== "string") {
          reject(new Error("Unable to read image file."));
          return;
        }

        const img = new Image();
        img.onload = () => {
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          let targetWidth = img.width;
          let targetHeight = img.height;

          if (is16x9) {
            const targetRatio = 16 / 9;
            const imgRatio = img.width / img.height;

            if (imgRatio > targetRatio) {
              // Image is wider than 16:9 -> crop left and right sides evenly
              sourceWidth = Math.round(img.height * targetRatio);
              sourceX = Math.round((img.width - sourceWidth) / 2);
            } else {
              // Image is taller than 16:9 -> crop top and bottom evenly
              sourceHeight = Math.round(img.width / targetRatio);
              sourceY = Math.round((img.height - sourceHeight) / 2);
            }

            // Standardize output up to 1600x900
            const maxWidth = 1600;
            targetWidth = Math.min(maxWidth, Math.max(800, sourceWidth));
            targetHeight = Math.round(targetWidth / targetRatio);
          } else {
            const maxWidth = 1600;
            if (targetWidth > maxWidth) {
              targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
              targetWidth = maxWidth;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas context is unavailable."));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
                resolve({ blob, dataUrl });
              } else {
                reject(new Error("Failed to encode compressed image blob."));
              }
            },
            "image/jpeg",
            0.88
          );
        };

        img.onerror = () => reject(new Error("Failed to load image format."));
        img.src = result;
      };

      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Image size exceeds 20MB limit. Please choose a smaller file.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setFileName(file.name);

    if (!altText) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setAltText(cleanName);
    }

    try {
      const { blob, dataUrl } = await processAndCropImage(file);
      setProcessedBlob(blob);
      setPreviewDataUrl(dataUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to process and crop image.");
    } finally {
      setIsProcessing(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === "upload") {
      if (!processedBlob) {
        setError("Please select or drop an image file.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const cleanName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        const res = await api.media.upload(processedBlob, cleanName);
        onInsert(res.url, altText.trim() || cleanName || "Banner image");
        handleClose();
      } catch (err: any) {
        setError(err?.message || "Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      if (!imageUrl.trim()) {
        setError("Please enter a valid image URL.");
        return;
      }
      onInsert(imageUrl.trim(), altText.trim() || "Image");
      handleClose();
    }
  };

  const handleClose = () => {
    setImageUrl("");
    setAltText("");
    setPreviewDataUrl(null);
    setProcessedBlob(null);
    setFileName("");
    setError(null);
    setIsUploading(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">
                {title}
              </h3>
              {is16x9 && (
                <p className="text-[11px] text-on-surface-variant font-mono">
                  Standard 16:9 aspect ratio applied
                </p>
              )}
            </div>
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
                  ? "bg-surface shadow-xs text-on-surface font-semibold"
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
                  ? "bg-surface shadow-xs text-on-surface font-semibold"
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

              {isProcessing ? (
                <div className="w-full aspect-[16/9] rounded-lg border border-outline-variant/30 bg-surface-container-low flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-mono">Cropping to 16:9 format...</span>
                </div>
              ) : previewDataUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low aspect-[16/9] w-full group flex items-center justify-center shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewDataUrl}
                    alt="16:9 Preview"
                    className="w-full h-full object-cover"
                  />
                  {is16x9 && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white font-medium shadow-sm">
                      16:9 Standard Banner
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary-warm text-xs px-3 py-1.5 bg-surface/90"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewDataUrl(null);
                        setProcessedBlob(null);
                        setFileName("");
                      }}
                      className="btn-secondary-warm text-xs px-3 py-1.5 bg-surface/90 text-error hover:text-error"
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
                    Click to browse or drag and drop banner image
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Auto-crops to consistent 16:9 standard · JPG, PNG, WebP (up to 20MB)
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
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {imageUrl && (
                <div className="rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low aspect-[16/9] w-full flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
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
              placeholder="e.g. Architectural skyline at dusk"
              className="w-full px-3.5 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleClose}
              className="btn-secondary-warm px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isUploading ||
                isProcessing ||
                (tab === "upload" ? !processedBlob : !imageUrl)
              }
              className="btn-primary-warm px-5 py-2 text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Insert Banner</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
