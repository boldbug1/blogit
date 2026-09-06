"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme, Theme } from "@/context/ThemeContext";
import {
  Globe,
  User,
  Palette,
  CheckCircle2,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Code2,
  Check,
  AlertCircle,
  X,
  Sun,
  Moon,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    themes,
    activeTheme,
    activeThemeId,
    mode,
    setMode,
    toggleMode,
    setTheme,
    saveCustomTheme,
    deleteCustomTheme,
    resetThemes,
    exportThemesJSON,
    importThemesJSON,
  } = useTheme();

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

  // Custom Theme Builder state
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeMode, setNewThemeMode] = useState<"light" | "dark">(mode || "light");
  const [newPrimary, setNewPrimary] = useState("#4f46e5");
  const [newBackground, setNewBackground] = useState(mode === "dark" ? "#090d16" : "#ffffff");
  const [newSurfaceContainer, setNewSurfaceContainer] = useState(mode === "dark" ? "#1e293b" : "#f1f5f9");
  const [newOnSurface, setNewOnSurface] = useState(mode === "dark" ? "#f8fafc" : "#0f172a");
  const [newSecondary, setNewSecondary] = useState(mode === "dark" ? "#94a3b8" : "#64748b");

  // Raw JSON Editor state
  const [isRawJsonOpen, setIsRawJsonOpen] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;

    const customTheme: Theme = {
      id: `custom-${Date.now().toString(36)}`,
      name: newThemeName.trim(),
      description: `Custom ${newThemeMode} theme created from Settings`,
      mode: newThemeMode,
      colors: {
        primary: newPrimary,
        primaryContainer: newPrimary,
        primaryFixed: newPrimary,
        secondary: newSecondary,
        background: newBackground,
        surface: newBackground,
        surfaceCream: newSurfaceContainer,
        surfaceContainer: newSurfaceContainer,
        surfaceContainerLow: newBackground,
        onSurface: newOnSurface,
        onSurfaceVariant: newSecondary,
        outlineVariant: newSurfaceContainer,
        borderWarm: newSurfaceContainer,
      },
    };

    saveCustomTheme(customTheme);
    setIsCreatingTheme(false);
    setNewThemeName("");
  };

  const handleExportJSON = () => {
    const json = exportThemesJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "themes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenRawJson = () => {
    setRawJsonText(exportThemesJSON());
    setJsonError(null);
    setJsonSuccess(false);
    setIsRawJsonOpen(true);
  };

  const handleSaveRawJson = () => {
    setJsonError(null);
    const ok = importThemesJSON(rawJsonText);
    if (ok) {
      setJsonSuccess(true);
      setTimeout(() => {
        setIsRawJsonOpen(false);
        setJsonSuccess(false);
      }, 1200);
    } else {
      setJsonError(
        "Invalid themes.json format. Please ensure it is a JSON array of themes with id, name, and colors."
      );
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <Navbar />
        <main className="w-full pt-28 pb-20 flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors duration-200">
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
              Manage your publication, domain, profile, and visual theme.
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
            <div className="p-6 sm:p-8 rounded-lg bg-surface shadow-sm border border-outline-variant/30 space-y-6">
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
            <div className="p-6 sm:p-8 rounded-lg bg-surface shadow-sm border border-outline-variant/30 space-y-6">
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

            {/* Theme & Styling Section */}
            <div className="p-6 sm:p-8 rounded-lg bg-surface shadow-sm border border-outline-variant/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">
                      Appearance &amp; Themes
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Choose from presets or create and edit themes via themes.json
                    </p>
                  </div>
                </div>

                {/* Theme Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTheme(!isCreatingTheme)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCreatingTheme ? "Close Builder" : "New Custom Theme"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRawJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-outline-variant/40 hover:bg-surface-container-low text-on-surface transition-colors"
                    title="Edit or import themes.json directly"
                  >
                    <Code2 className="w-3.5 h-3.5 text-secondary" />
                    <span>Edit themes.json</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-outline-variant/40 hover:bg-surface-container-low text-on-surface transition-colors"
                    title="Download themes.json file"
                  >
                    <Download className="w-3.5 h-3.5 text-secondary" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetThemes}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-on-surface-variant hover:text-error transition-colors"
                    title="Reset all themes to default presets"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Theme Mode Selector (Light vs Dark) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  Theme Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("light")}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all ${
                      mode === "light"
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-outline-variant/40 hover:border-outline-variant/70 bg-surface-container-lowest text-on-surface"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        mode === "light"
                          ? "bg-primary text-white"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm">
                        Light Mode
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Pure crisp white background (#ffffff)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("dark")}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all ${
                      mode === "dark"
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-outline-variant/40 hover:border-outline-variant/70 bg-surface-container-lowest text-on-surface"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        mode === "dark"
                          ? "bg-primary text-white"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm">
                        Dark Mode
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Deep slate background (#090d16)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Theme Builder Drawer/Accordion */}
              {isCreatingTheme && (
                <div className="p-5 rounded-lg border border-primary/25 bg-primary/5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-on-surface">
                        Create Custom Theme
                      </h4>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Saved directly to your custom themes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Theme Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        placeholder="e.g. Velvet Night"
                        className="w-full px-3 py-2 text-xs bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Mode
                      </label>
                      <select
                        value={newThemeMode}
                        onChange={(e) => {
                          const m = e.target.value as "light" | "dark";
                          setNewThemeMode(m);
                          if (m === "dark") {
                            setNewBackground("#090d16");
                            setNewSurfaceContainer("#1e293b");
                            setNewOnSurface("#f8fafc");
                            setNewSecondary("#94a3b8");
                          } else {
                            setNewBackground("#ffffff");
                            setNewSurfaceContainer("#f1f5f9");
                            setNewOnSurface("#0f172a");
                            setNewSecondary("#64748b");
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Primary Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newPrimary}
                          onChange={(e) => setNewPrimary(e.target.value)}
                          className="w-8 h-8 p-0 rounded border border-outline-variant/40 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newPrimary}
                          onChange={(e) => setNewPrimary(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Background / Paper
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newBackground}
                          onChange={(e) => setNewBackground(e.target.value)}
                          className="w-8 h-8 p-0 rounded border border-outline-variant/40 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newBackground}
                          onChange={(e) => setNewBackground(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Cards / Containers
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newSurfaceContainer}
                          onChange={(e) => setNewSurfaceContainer(e.target.value)}
                          className="w-8 h-8 p-0 rounded border border-outline-variant/40 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newSurfaceContainer}
                          onChange={(e) => setNewSurfaceContainer(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">
                        Main Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newOnSurface}
                          onChange={(e) => setNewOnSurface(e.target.value)}
                          className="w-8 h-8 p-0 rounded border border-outline-variant/40 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newOnSurface}
                          onChange={(e) => setNewOnSurface(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Mini Preview */}
                  <div
                    className="p-4 rounded-lg border shadow-inner transition-colors"
                    style={{
                      backgroundColor: newBackground,
                      borderColor: newSurfaceContainer,
                      color: newOnSurface,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[11px] font-bold tracking-tight uppercase"
                        style={{ color: newPrimary }}
                      >
                        Live Preview
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: newPrimary,
                          color: "#ffffff",
                        }}
                      >
                        {newThemeMode}
                      </span>
                    </div>
                    <h5
                      className="font-headline text-base font-bold mb-1"
                      style={{ color: newOnSurface }}
                    >
                      {newThemeName || "The Future of Digital Publishing"}
                    </h5>
                    <p
                      className="text-xs opacity-75 mb-3"
                      style={{ color: newOnSurface }}
                    >
                      Sun-baked simplicity, tactile editorial grain, and modern minimalism.
                    </p>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: newPrimary }}
                    >
                      Read Story
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTheme(false)}
                      className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustomTheme}
                      disabled={!newThemeName.trim()}
                      className="btn-primary-warm px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Save &amp; Activate Theme
                    </button>
                  </div>
                </div>
              )}

              {/* Raw JSON Editor Modal */}
              {isRawJsonOpen && (
                <div className="p-5 rounded-lg border border-outline-variant/40 bg-surface-container-low space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-primary" />
                        <span>Edit themes.json Directly</span>
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Paste, edit, or customize any palette directly in JSON format.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRawJsonOpen(false)}
                      className="text-on-surface-variant hover:text-on-surface p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {jsonError && (
                    <div className="p-3 rounded bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  {jsonSuccess && (
                    <div className="p-3 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>themes.json imported and applied successfully!</span>
                    </div>
                  )}

                  <textarea
                    rows={12}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-surface-container-lowest text-on-surface rounded-md border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="[ { id: '...', name: '...', colors: { ... } } ]"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRawJsonOpen(false)}
                      className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRawJson}
                      className="btn-primary-warm px-4 py-1.5 text-xs font-semibold"
                    >
                      Save &amp; Apply themes.json
                    </button>
                  </div>
                </div>
              )}

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {themes.map((theme) => {
                  const isCurrent = activeThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                        isCurrent
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                          : "border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-lowest"
                      }`}
                    >
                      <div>
                        {/* Header with Mode & Active Status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            <h4 className="font-semibold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">
                              {theme.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            {theme.isCustom && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Custom
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                              {theme.mode || "light"}
                            </span>
                            {isCurrent && (
                              <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px] ml-1">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-3">
                          {theme.description}
                        </p>
                      </div>

                      {/* Color Palette Preview Swatches */}
                      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Primary Accent"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                            style={{
                              backgroundColor:
                                theme.colors.background || theme.colors.surface,
                            }}
                            title="Background"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                            style={{
                              backgroundColor:
                                theme.colors.surfaceContainer ||
                                theme.colors.surface,
                            }}
                            title="Surface Container"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: theme.colors.onSurface }}
                            title="Text Color"
                          />
                        </div>

                        {theme.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomTheme(theme.id);
                            }}
                            className="text-on-surface-variant/60 hover:text-error p-1 transition-colors"
                            title="Delete custom theme"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

