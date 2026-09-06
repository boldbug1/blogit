import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-surface/90 border-t border-outline-variant/30 pt-16 pb-12 text-sm text-on-surface-variant relative z-10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <Logo size="lg" />
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed font-body">
            Don't just think , blog it.
          </p>
          
        </div>

      

        {/* Company & Legal Column */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-headline font-semibold text-sm text-on-surface uppercase tracking-wider">
            Account &amp; Legal
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link href="/login" className="hover:text-primary transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant/70 font-mono">
        <p>© {new Date().getFullYear()} blogit.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <span>·</span>
          <Link href="/" className="hover:text-primary transition-colors">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
