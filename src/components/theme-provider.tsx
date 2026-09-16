"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/**
 * Class-based theming. The dark gruvbox look is the brand default: first-time
 * visitors always land on dark regardless of OS preference, and the header
 * toggle persists the choice under the "kamama-theme" storage key.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="kamama-theme"
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}

/**
 * Keeps <meta name="theme-color"> in lockstep with the active theme so the
 * mobile browser chrome matches the page background in both modes.
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "light" ? "#FBF7EE" : "#0D1117";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [resolvedTheme]);

  return null;
}
