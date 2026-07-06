export type MaurieTheme = "light" | "dark";

export const MAURIE_THEME_STORAGE_KEY = "maurie-theme";
export const MAURIE_THEME_CHANGE_EVENT = "maurie-theme-change";
export const DEFAULT_MAURIE_THEME: MaurieTheme = "dark";

export function isMaurieTheme(value: string | null): value is MaurieTheme {
  return value === "light" || value === "dark";
}
