"use client";

import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Logo } from "@/components/Logo";
import {
  Menu,
  X,
  Search,
  BookOpen,
  LayoutDashboard,
  Settings,
  LogOut,
  SquarePen,
  Tag,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

const POPULAR_TOPICS = [
  "Technology",
  "AI",
  "Programming",
  "Design",
  "Writing",
  "Productivity",
];

function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const updateSearch = (value: string) => {
    setSearchQuery(value);
    // Dispatch custom event for immediate responsive client-side filtering on home page
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("blogit-search", { detail: value })
      );
    }
    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/") {
      const q = searchQuery.trim();
      router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative w-28 xs:w-44 sm:w-60 md:w-72 transition-all min-w-[100px]"
    >
      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-surface-variant/60 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search..."
        className="w-full pl-7 sm:pl-9 pr-6 sm:pr-7 py-1.5 text-xs sm:text-sm bg-surface-container-low hover:bg-surface-container focus:bg-surface border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50 shadow-2xs"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => updateSearch("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface p-0.5"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on Escape and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [sidebarOpen]);

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs transition-all">
        <div className="h-16 sm:h-18 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Menu Button, Logo, and Adjacent Search Input */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Sidebar Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="Open navigation sidebar"
              title="Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Bigger, Text-Only Logo */}
            <Logo href="/" className="shrink-0" />

            {/* Search Input right beside logo */}
            <Suspense fallback={null}>
              <SearchInput />
            </Suspense>
          </div>

          {/* Right: Theme Toggle, Write Button and User Profile / Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Dark / Light Mode Toggle: Signed-in users only */}
            {user && (
              <button
                type="button"
                onClick={toggleMode}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle dark mode"
                title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {mode === "dark" ? (
                  <Sun className="w-4 h-4 text-secondary hover:text-on-surface" />
                ) : (
                  <Moon className="w-4 h-4 text-secondary hover:text-on-surface" />
                )}
              </button>
            )}

            {/* Write Button */}
            <Link
              href={user ? "/editor/new" : "/login"}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <SquarePen className="w-4 h-4 text-primary" />
              <span className="hidden xs:inline">Write</span>
            </Link>

            {user ? (
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
                    className="absolute right-0 mt-2 w-60 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/40 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
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
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-secondary" />
                      <span>Stories (Feed)</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/editor/new"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <SquarePen className="w-4 h-4 text-secondary" />
                      <span>Write a story</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Settings className="w-4 h-4 text-secondary" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-outline-variant/20 my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-error hover:bg-error/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary-warm px-3.5 py-1.5 text-xs sm:text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Left Navigation Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside className="relative w-72 sm:w-80 max-w-[85vw] bg-surface border-r border-outline-variant/30 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
                <Logo href="/" />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/5 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Navigation Links */}
              <nav className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary font-mono px-3 mb-2">
                  Navigation
                </div>

                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Stories (Feed)</span>
                </Link>

                {user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                )}

                <Link
                  href={user ? "/editor/new" : "/login"}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <SquarePen className="w-4 h-4 text-secondary" />
                  <span>Write a Story</span>
                </Link>

                {user && (
                  <Link
                    href="/settings"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <Settings className="w-4 h-4 text-secondary" />
                    <span>Settings</span>
                  </Link>
                )}
              </nav>

              {/* Popular Topics Section */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/30">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary font-mono px-3">
                  Discover Topics
                </div>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {POPULAR_TOPICS.map((topic) => (
                    <Link
                      key={topic}
                      href={`/?tag=${encodeURIComponent(topic)}`}
                      onClick={() => setSidebarOpen(false)}
                      className="px-2.5 py-1 rounded-md text-xs bg-surface-container-low hover:bg-surface-container hover:text-primary border border-outline-variant/30 text-on-surface-variant transition-colors"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Mode row inside drawer: Signed-in users only */}
            {user && (
              <div className="py-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface flex items-center gap-2">
                  {mode === "dark" ? (
                    <Moon className="w-4 h-4 text-secondary" />
                  ) : (
                    <Sun className="w-4 h-4 text-secondary" />
                  )}
                  <span>{mode === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-surface-container-low border border-outline-variant/40 text-on-surface hover:text-primary transition-colors"
                >
                  Switch to {mode === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            )}

            {/* Bottom Account / Auth Block in Drawer */}
            <div className="pt-3 border-t border-outline-variant/30">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-on-surface truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 rounded-lg transition-colors border border-error/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="btn-secondary-warm w-full text-xs py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setSidebarOpen(false)}
                    className="btn-primary-warm w-full text-xs py-2"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
