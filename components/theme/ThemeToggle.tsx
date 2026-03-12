"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--asana-text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--asana-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--asana-border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--asana-bg-app)]"
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      title="Switch theme"
    >
      <span className="sr-only">Switch theme</span>
      <span className="relative h-5 w-5">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
