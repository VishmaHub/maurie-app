"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_MAURIE_THEME,
  isMaurieTheme,
  MAURIE_THEME_CHANGE_EVENT,
  MAURIE_THEME_STORAGE_KEY,
  type MaurieTheme
} from "@/lib/theme/theme";

interface ThemeToggleProps {
  readonly className?: string;
}

function getServerThemeSnapshot(): MaurieTheme {
  return DEFAULT_MAURIE_THEME;
}

function getClientThemeSnapshot(): MaurieTheme {
  if (typeof window === "undefined") {
    return getServerThemeSnapshot();
  }

  const storedTheme = window.localStorage.getItem(MAURIE_THEME_STORAGE_KEY);

  if (isMaurieTheme(storedTheme)) {
    return storedTheme;
  }

  const htmlTheme = document.documentElement.dataset.theme ?? null;

  if (isMaurieTheme(htmlTheme)) {
    return htmlTheme;
  }

  return DEFAULT_MAURIE_THEME;
}

function subscribeToThemeChanges(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(MAURIE_THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(MAURIE_THEME_CHANGE_EVENT, onStoreChange);
  };
}

function setMaurieTheme(theme: MaurieTheme): void {
  window.localStorage.setItem(MAURIE_THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event(MAURIE_THEME_CHANGE_EVENT));
}

/**
 * ThemeToggle controls the global Mauri-E app theme.
 *
 * The current theme is stored once at app level so individual pages do not need
 * their own local dark/light state.
 */
export function ThemeToggle(props: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getClientThemeSnapshot,
    getServerThemeSnapshot
  );

  const nextTheme: MaurieTheme = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => setMaurieTheme(nextTheme)}
      className={["maurie-theme-toggle", props.className].filter(Boolean).join(" ")}
    >
      {label}
    </button>
  );
}
