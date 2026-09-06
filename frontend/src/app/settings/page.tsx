"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Globe,
  User,
  Palette,
  Bell,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading, router]);

  const [pubName, setPubName] = useState("My Blog");
  const [subdomain, setSubdomain] = useState(
    user?.name?.toLowerCase().replace(/\s+/g, "") || "author"
  );
  const [customDomain, setCustomDomain] = useState("");
  const [bio, setBio] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <main className="w-full pt-28 pb-20 flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-28 pb-20 flex-1">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-2">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Manage your profile, domain, and preferences.
            </p>
          </div>

          {isSaved && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Site & Domain Card */}
            <div className="p-6 sm:p-8 rounded-lg bg-white/80 shadow-sm border border-outline-variant/30 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Site &amp; Domain
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Subdomain
                  </label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-2.5 bg-surface-container text-on-surface-variant rounded-l-md border border-r-0 border-outline-variant/40 text-xs font-mono">
                      blogit.pub/@
                    </span>
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-r-md border border-outline-variant/40 focus:outline-none focus:border-primary text-sm font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="yourdomain.com"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary text-sm font-mono transition-colors"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Connect your custom domain with automatic SSL.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="p-6 sm:p-8 rounded-lg bg-white/80 shadow-sm border border-outline-variant/30 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Profile
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      defaultValue={user?.email || ""}
                      className="w-full px-4 py-2.5 bg-surface-container text-on-surface-variant rounded-md border border-outline-variant/40 text-sm opacity-80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    placeholder="Tell readers a bit about yourself..."
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary text-sm transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Theme Card */}
            <div className="p-6 sm:p-8 rounded-lg bg-white/80 shadow-sm border border-outline-variant/30 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Theme
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border-2 border-primary bg-primary/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                      Sahara (Warm)
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Burnt Sienna, warm linen background, EB Garamond
                    </p>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                </div>

                <div className="p-4 rounded-md border border-outline-variant/40 bg-surface-container-lowest opacity-60 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                      Nordic Clean (Coming Soon)
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Cool slate, monochrome contrast
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn-primary-warm px-6 py-3 text-xs sm:text-sm font-semibold"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
