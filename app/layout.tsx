import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProviderScript } from "@/components/theme/theme-provider-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mauri-E",
  description:
    "A premium business management, creative networking, and project collaboration ecosystem.",
  applicationName: "Mauri-E"
};

const systemFontStack = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
} as const;

/**
 * RootLayout owns the global document shell.
 *
 * The theme provider script runs before hydration so every page can rely on the
 * same CSS variables for dark and light mode.
 */
export default function RootLayout(props: { readonly children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className="h-full scroll-smooth">
      <head>
        <ThemeProviderScript />
      </head>

      <body
        style={systemFontStack}
        className="min-h-dvh bg-[var(--maurie-bg)] text-[var(--maurie-text)] antialiased selection:bg-[var(--maurie-orange)] selection:text-[var(--maurie-black)]"
      >
        <div className="maurie-app-background fixed inset-0 -z-10" />
        {props.children}
      </body>
    </html>
  );
}
