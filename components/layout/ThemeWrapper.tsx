"use client";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
