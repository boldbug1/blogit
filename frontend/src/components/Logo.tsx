import Link from "next/link";
import React from "react";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  textSize?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
  xl: "text-4xl sm:text-5xl",
  "2xl": "text-5xl sm:text-6xl",
};

export function Logo({
  className = "",
  href = "/",
  size = "md",
  textSize,
}: LogoProps) {
  const resolvedSize = textSize || sizeClasses[size] || sizeClasses.md;

  return (
    <Link
      href={href}
      className={`inline-flex items-center select-none group focus:outline-none ${className}`}
    >
      <span
        className={`font-headline font-black tracking-tight text-on-surface group-hover:text-primary transition-colors ${resolvedSize}`}
      >
        blogit<span className="text-primary font-black">.</span>
      </span>
    </Link>
  );
}
