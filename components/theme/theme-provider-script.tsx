import { DEFAULT_MAURIE_THEME, MAURIE_THEME_STORAGE_KEY } from "@/lib/theme/theme";

const themeProviderScript = `
(function () {
  try {
    var storageKey = ${JSON.stringify(MAURIE_THEME_STORAGE_KEY)};
    var defaultTheme = ${JSON.stringify(DEFAULT_MAURIE_THEME)};
    var storedTheme = window.localStorage.getItem(storageKey);
    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : defaultTheme;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = ${JSON.stringify(DEFAULT_MAURIE_THEME)};
    document.documentElement.style.colorScheme = ${JSON.stringify(DEFAULT_MAURIE_THEME)};
  }
})();
`;

/**
 * ThemeProviderScript applies the saved theme before React hydrates.
 *
 * This prevents a flash of the wrong theme and avoids hydration mismatch when
 * the user has already selected a dark or light preference.
 */
export function ThemeProviderScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeProviderScript }} />;
}
