import Link from "next/link";
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Logo({ className = "h-8 w-auto", showText = true, href = "/" }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 group">
      <svg
        viewBox="0 0 40 40"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="6"
          y="8"
          width="28"
          height="24"
          rx="6"
          fill="#c2652a"
          fillOpacity="0.15"
        />
        <path
          d="M13 14H27M13 20H23M13 26H19"
          stroke="#c2652a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="27" cy="25" r="3" fill="#c2652a" />
      </svg>
      {showText && (
        <span className="font-headline font-bold text-2xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
          blogit<span className="text-primary font-bold">.</span>
        </span>
      )}
    </Link>
  );
}
