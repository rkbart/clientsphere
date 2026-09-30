"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

// Applies the stored theme to <html> so [data-theme="dark"] tokens take effect.
export function ThemeEffect() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
