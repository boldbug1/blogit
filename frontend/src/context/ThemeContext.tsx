"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import defaultThemesData from "@/data/themes.json";

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
  mode?: "light" | "dark";
  colors: ThemeColors;
  isCustom?: boolean;
}

interface ThemeContextType {
  themes: Theme[];
  activeTheme: Theme;
  activeThemeId: string;
  setTheme: (id: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
  resetThemes: () => void;
  exportThemesJSON: () => string;
  importThemesJSON: (jsonStr: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Primary palette
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

  // Surfaces & Backgrounds
  const bg = theme.colors.background || theme.colors.surface;
  root.style.setProperty("--color-background", bg);
  root.style.setProperty("--color-surface", theme.colors.surface);
  root.style.setProperty(
    "--color-surface-dim",
    theme.colors.surfaceContainer || theme.colors.surface
  );
  root.style.setProperty("--color-surface-bright", theme.colors.surface);
  root.style.setProperty(
    "--color-surface-variant",
    theme.colors.surfaceContainerLow || theme.colors.surface
  );
  root.style.setProperty(
    "--color-surface-cream",
    theme.colors.surfaceCream || theme.colors.surface
  );
  root.style.setProperty(
    "--color-surface-container",
    theme.colors.surfaceContainer || theme.colors.surface
  );
  root.style.setProperty(
    "--color-surface-container-low",
    theme.colors.surfaceContainerLow || theme.colors.surface
  );
  root.style.setProperty(
    "--color-surface-container-high",
    theme.colors.surfaceContainer || theme.colors.surface
  );
  root.style.setProperty(
    "--color-surface-container-highest",
    theme.colors.surfaceContainer || theme.colors.surface
  );

  // Text / Typography colors
  root.style.setProperty("--color-on-background", theme.colors.onSurface);
  root.style.setProperty("--color-on-surface", theme.colors.onSurface);
  root.style.setProperty(
    "--color-on-surface-variant",
    theme.colors.onSurfaceVariant
  );

  // Borders and Outlines
  root.style.setProperty(
    "--color-outline-variant",
    theme.colors.outlineVariant
  );
  root.style.setProperty(
    "--color-border-warm",
    theme.colors.borderWarm || theme.colors.outlineVariant
  );

  // Attributes for CSS targeting
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-mode", theme.mode || "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>(
    defaultThemesData as Theme[]
  );
  const [activeThemeId, setActiveThemeId] = useState<string>("sahara");

  // Load custom themes and active theme from localStorage on client mount
  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem("blogit_custom_themes");
      let allThemes = [...(defaultThemesData as Theme[])];
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed)) {
          // Merge custom themes, avoiding duplicate IDs
          const customIds = new Set(parsed.map((t) => t.id));
          allThemes = [
            ...allThemes.filter((t) => !customIds.has(t.id)),
            ...parsed.map((t) => ({ ...t, isCustom: true })),
          ];
        }
      }
      setThemes(allThemes);

      const savedThemeId = localStorage.getItem("blogit_active_theme");
      const targetId =
        savedThemeId && allThemes.some((t) => t.id === savedThemeId)
          ? savedThemeId
          : "sahara";

      setActiveThemeId(targetId);
      const active =
        allThemes.find((t) => t.id === targetId) || allThemes[0];
      if (active) {
        applyThemeToDOM(active);
      }
    } catch (e) {
      console.error("Failed to initialize themes:", e);
    }
  }, []);

  const activeTheme =
    themes.find((t) => t.id === activeThemeId) ||
    themes[0] ||
    (defaultThemesData[0] as Theme);

  const setTheme = (id: string) => {
    const target = themes.find((t) => t.id === id);
    if (!target) return;

    setActiveThemeId(id);
    localStorage.setItem("blogit_active_theme", id);
    applyThemeToDOM(target);
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

      // Save custom ones to localStorage
      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem("blogit_custom_themes", JSON.stringify(customOnly));

      return updated;
    });

    setActiveThemeId(themeToSave.id);
    localStorage.setItem("blogit_active_theme", themeToSave.id);
    applyThemeToDOM(themeToSave);
  };

  const deleteCustomTheme = (id: string) => {
    setThemes((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem("blogit_custom_themes", JSON.stringify(customOnly));
      return updated;
    });

    if (activeThemeId === id) {
      setTheme("sahara");
    }
  };

  const resetThemes = () => {
    localStorage.removeItem("blogit_custom_themes");
    const defaults = defaultThemesData as Theme[];
    setThemes(defaults);
    setTheme("sahara");
  };

  const exportThemesJSON = () => {
    return JSON.stringify(themes, null, 2);
  };

  const importThemesJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed) || parsed.length === 0) return false;

      // Validate basic properties
      for (const item of parsed) {
        if (!item.id || !item.name || !item.colors?.primary || !item.colors?.surface) {
          return false;
        }
      }

      // Mark imported ones that aren't defaults as custom
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
        setTheme,
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
