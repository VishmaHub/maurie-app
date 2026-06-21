import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function RootLayout(props: { readonly children: ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth bg-zinc-50 dark:bg-black">
      <body
        style={systemFontStack}
        className="min-h-dvh bg-[var(--maurie-cream)] text-[var(--maurie-text)] antialiased selection:bg-[var(--maurie-orange)] selection:text-[var(--maurie-black)] dark:bg-[var(--maurie-black)]"
      >
        <div className="maurie-app-background fixed inset-0 -z-10" />
        {props.children}
      </body>
    </html>
  );
}
