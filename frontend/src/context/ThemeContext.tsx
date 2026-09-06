"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import defaultThemesData from "@/data/themes.json";
import { useAuth } from "@/context/AuthContext";

export type ColorMode = "light" | "dark";

export interface ThemeColors {
  primary: string;
  primaryContainer?: string;
  primaryFixed?: string;
  secondary: string;
  background?: string;
  surface: string;
  surfaceCream?: string;
  surfaceContainer?: string;
  surfaceContainerLow?: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  borderWarm?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  mode?: ColorMode;
  colors: ThemeColors;
  isCustom?: boolean;
}

interface ThemeContextType {
  themes: Theme[];
  activeTheme: Theme;
  activeThemeId: string;
  mode: ColorMode;
  setTheme: (id: string) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
  resetThemes: () => void;
  exportThemesJSON: () => string;
  importThemesJSON: (jsonStr: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function applyThemeToDOM(theme: Theme, mode: ColorMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Toggle .dark class on <html>
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Primary palette (dynamic from active theme)
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty(
    "--color-primary-container",
    theme.colors.primaryContainer || theme.colors.primary
  );
  root.style.setProperty(
    "--color-primary-fixed",
    theme.colors.primaryFixed || theme.colors.primary
  );

  // Secondary
  root.style.setProperty("--color-secondary", theme.colors.secondary);

  if (mode === "dark") {
    // Cohesive, modern dark mode palette
    const bg = theme.isCustom && theme.mode === "dark" && theme.colors.background
      ? theme.colors.background
      : "#090d16";
    const surface = theme.isCustom && theme.mode === "dark" && theme.colors.surface
      ? theme.colors.surface
      : "#0f172a";
    const surfaceContainer = "#161f30";
    const surfaceContainerLow = "#0d1424";
    const onSurface = "#f8fafc";
    const onSurfaceVariant = "#94a3b8";
    const outlineVariant = "#1e293b";

    root.style.setProperty("--color-background", bg);
    root.style.setProperty("--color-surface", surface);
    root.style.setProperty("--color-surface-dim", surfaceContainerLow);
    root.style.setProperty("--color-surface-bright", surface);
    root.style.setProperty("--color-surface-variant", surfaceContainer);
    root.style.setProperty("--color-surface-cream", surfaceContainerLow);
    root.style.setProperty("--color-surface-container", surfaceContainer);
    root.style.setProperty("--color-surface-container-low", surfaceContainerLow);
    root.style.setProperty("--color-surface-container-high", "#223049");
    root.style.setProperty("--color-surface-container-highest", "#2d3f5e");
    root.style.setProperty("--color-surface-container-lowest", "#090d16");

    root.style.setProperty("--color-on-background", onSurface);
    root.style.setProperty("--color-on-surface", onSurface);
    root.style.setProperty("--color-on-surface-variant", onSurfaceVariant);

    root.style.setProperty("--color-outline", "#475569");
    root.style.setProperty("--color-outline-variant", outlineVariant);
    root.style.setProperty("--color-border-warm", outlineVariant);
  } else {
    // Light mode palette: crisp pure white or theme-specified background
    const bg = theme.colors.background || "#ffffff";
    const surface = theme.colors.surface || "#ffffff";
    const surfaceContainer = theme.colors.surfaceContainer || "#f1f5f9";
    const surfaceContainerLow = theme.colors.surfaceContainerLow || "#f8fafc";
    const onSurface = theme.colors.onSurface || "#0f172a";
    const onSurfaceVariant = theme.colors.onSurfaceVariant || "#64748b";
    const outlineVariant = theme.colors.outlineVariant || "#e2e8f0";

    root.style.setProperty("--color-background", bg);
    root.style.setProperty("--color-surface", surface);
    root.style.setProperty("--color-surface-dim", surfaceContainerLow);
    root.style.setProperty("--color-surface-bright", surface);
    root.style.setProperty("--color-surface-variant", surfaceContainer);
    root.style.setProperty("--color-surface-cream", surfaceContainerLow);
    root.style.setProperty("--color-surface-container", surfaceContainer);
    root.style.setProperty("--color-surface-container-low", surfaceContainerLow);
    root.style.setProperty("--color-surface-container-high", "#e2e8f0");
    root.style.setProperty("--color-surface-container-highest", "#cbd5e1");
    root.style.setProperty("--color-surface-container-lowest", "#ffffff");

    root.style.setProperty("--color-on-background", onSurface);
    root.style.setProperty("--color-on-surface", onSurface);
    root.style.setProperty("--color-on-surface-variant", onSurfaceVariant);

    root.style.setProperty("--color-outline", "#94a3b8");
    root.style.setProperty("--color-outline-variant", outlineVariant);
    root.style.setProperty("--color-border-warm", outlineVariant);
  }

  // Attributes for CSS targeting
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-mode", mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>(
    defaultThemesData as Theme[]
  );
  const [activeThemeId, setActiveThemeId] = useState<string>("sahara");
  const [mode, setModeState] = useState<ColorMode>("light");

  // Load custom themes from localStorage on client mount
  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem("blogit_custom_themes");
      let allThemes = [...(defaultThemesData as Theme[])];
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed)) {
          const customIds = new Set(parsed.map((t) => t.id));
          allThemes = [
            ...allThemes.filter((t) => !customIds.has(t.id)),
            ...parsed.map((t) => ({ ...t, isCustom: true })),
          ];
        }
      }
      setThemes(allThemes);
    } catch (e) {
      console.error("Failed to initialize themes:", e);
    }
  }, []);

  // Sync theme when user logs in or logs out
  useEffect(() => {
    if (!user) {
      // Signed-out users: strictly default signature Sahara theme in light mode
      const saharaTheme = themes.find((t) => t.id === "sahara") || themes[0];
      if (saharaTheme) {
        setActiveThemeId("sahara");
        setModeState("light");
        applyThemeToDOM(saharaTheme, "light");
      }
    } else {
      // Signed-in users: retrieve their saved theme and mode preferences
      try {
        const savedThemeId = localStorage.getItem("blogit_active_theme") || "sahara";
        const savedMode = (localStorage.getItem("blogit_mode") as ColorMode) || "light";
        const targetTheme = themes.find((t) => t.id === savedThemeId) || themes[0];
        setActiveThemeId(savedThemeId);
        setModeState(savedMode);
        if (targetTheme) {
          applyThemeToDOM(targetTheme, savedMode);
        }
      } catch (e) {
        console.error("Failed to load user theme preference:", e);
      }
    }
  }, [user, themes]);

  const activeTheme =
    themes.find((t) => t.id === activeThemeId) ||
    themes[0] ||
    (defaultThemesData[0] as Theme);

  const setTheme = (id: string) => {
    const target = themes.find((t) => t.id === id);
    if (!target) return;

    setActiveThemeId(id);
    localStorage.setItem("blogit_active_theme", id);

    // If theme has explicit mode, honor it if switching
    let newMode = mode;
    if (target.mode && target.mode !== mode && !localStorage.getItem("blogit_user_overrode_mode")) {
      newMode = target.mode;
      setModeState(newMode);
      localStorage.setItem("blogit_mode", newMode);
    }

    applyThemeToDOM(target, newMode);
  };

  const setMode = (newMode: ColorMode) => {
    setModeState(newMode);
    localStorage.setItem("blogit_mode", newMode);
    localStorage.setItem("blogit_user_overrode_mode", "true");
    applyThemeToDOM(activeTheme, newMode);
  };

  const toggleMode = () => {
    const nextMode: ColorMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
  };

  const saveCustomTheme = (newTheme: Theme) => {
    const themeToSave: Theme = {
      ...newTheme,
      isCustom: true,
      id:
        newTheme.id ||
        `custom-${Date.now().toString(36)}`,
    };

    setThemes((prev) => {
      const filtered = prev.filter((t) => t.id !== themeToSave.id);
      const updated = [...filtered, themeToSave];

      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem("blogit_custom_themes", JSON.stringify(customOnly));

      return updated;
    });

    setActiveThemeId(themeToSave.id);
    localStorage.setItem("blogit_active_theme", themeToSave.id);
    const newMode = themeToSave.mode || mode;
    setModeState(newMode);
    localStorage.setItem("blogit_mode", newMode);
    applyThemeToDOM(themeToSave, newMode);
  };

  const deleteCustomTheme = (id: string) => {
    setThemes((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem("blogit_custom_themes", JSON.stringify(customOnly));
      return updated;
    });

    if (activeThemeId === id) {
      setTheme("indigo");
    }
  };

  const resetThemes = () => {
    localStorage.removeItem("blogit_custom_themes");
    localStorage.removeItem("blogit_active_theme");
    localStorage.removeItem("blogit_mode");
    localStorage.removeItem("blogit_user_overrode_mode");
    const defaults = defaultThemesData as Theme[];
    setThemes(defaults);
    setActiveThemeId("indigo");
    setModeState("light");
    applyThemeToDOM(defaults[0], "light");
  };

  const exportThemesJSON = () => {
    return JSON.stringify(themes, null, 2);
  };

  const importThemesJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed) || parsed.length === 0) return false;

      for (const item of parsed) {
        if (!item.id || !item.name || !item.colors?.primary) {
          return false;
        }
      }

      const defaultIds = new Set((defaultThemesData as Theme[]).map((t) => t.id));
      const normalized: Theme[] = parsed.map((item) => ({
        ...item,
        isCustom: !defaultIds.has(item.id),
      }));

      setThemes(normalized);
      const customOnly = normalized.filter((t) => t.isCustom);
      localStorage.setItem("blogit_custom_themes", JSON.stringify(customOnly));

      if (normalized.length > 0) {
        setTheme(normalized[0].id);
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        activeThemeId,
        mode,
        setTheme,
        setMode,
        toggleMode,
        saveCustomTheme,
        deleteCustomTheme,
        resetThemes,
        exportThemesJSON,
        importThemesJSON,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
