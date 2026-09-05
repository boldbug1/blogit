import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="w-full bg-[#faf5ee] border-t border-[#d8d0c8]/40 pt-16 pb-12 text-sm text-on-surface-variant relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-6 space-y-4">
          <Logo />
          <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
            Where thoughtful writing finds its quiet home. Built on the
            philosophy: <em className="text-on-surface font-medium">don&apos;t just think, blog it</em>. A sunlit sanctuary crafted for essays, craft journalism, and direct subscriber resonance.
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs font-mono text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>API Engine: Go 1.26 stdlib • Postgres pgx</span>
          </div>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="font-headline font-semibold text-base text-on-surface">Platform</h4>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/#featured-stories" className="hover:text-primary transition-colors">
                Featured Stories
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/editor/new" className="hover:text-primary transition-colors">
                New Post
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="font-headline font-semibold text-base text-on-surface">Account</h4>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link href="/login" className="hover:text-primary transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary transition-colors">
                Get Started
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-primary transition-colors">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-6 border-t border-[#d8d0c8]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
        <p>© {new Date().getFullYear()} blogit. Sun-Baked Simplicity.</p>
        <div className="flex items-center gap-4">
          <span>Zero tracking scripts</span>
          <span>•</span>
          <span>Type-safe SQL</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
