"use client";

import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#e8e0d5]/70 animate-pulse rounded-xl ${className}`}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 space-y-10 pt-28 pb-24">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-44 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* 3 Metrics Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/80 border border-outline-variant/30 space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-9 w-16 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Analytics Card Skeleton */}
      <div className="p-7 sm:p-8 rounded-2xl bg-white/80 border border-outline-variant/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>

      {/* Posts List Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/80 border border-outline-variant/30 flex items-center justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex gap-3">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-3.5 w-1/2 rounded" />
            </div>
            <Skeleton className="h-20 w-24 rounded-xl hidden sm:block shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-8">
      <Skeleton className="h-4 w-28 rounded-lg" />

      {/* Title & Author */}
      <div className="space-y-4">
        <Skeleton className="h-12 sm:h-16 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4 rounded-xl" />
        <div className="flex items-center gap-3 py-4 border-y border-outline-variant/30">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <Skeleton className="h-64 sm:h-80 w-full rounded-2xl" />

      {/* Paragraph Lines Skeletons */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-11/12 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <div className="py-2" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}
