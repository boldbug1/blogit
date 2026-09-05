"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf5ee]/85 backdrop-blur-xl border-b border-[#d8d0c8]/40 shadow-[0_2px_12px_rgba(58,48,42,0.03)] transition-all">
      <div className="h-18 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo href={user ? "/dashboard" : "/"} />
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {user ? (
              <Link
                href="/dashboard"
                className="text-on-surface hover:text-primary font-semibold transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-on-surface hover:text-primary font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/#featured-stories"
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Featured Stories
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs hover:bg-primary/20 transition-all focus:outline-none ring-2 ring-transparent focus:ring-primary/20"
                  aria-label="User menu"
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-outline-variant/20">
                      <p className="font-semibold text-on-surface truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {user.email}
                      </p>
                    </div>



                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Settings className="w-4 h-4 text-secondary" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-outline-variant/20 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-error hover:bg-error/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary-warm px-4 py-2 text-xs sm:text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
