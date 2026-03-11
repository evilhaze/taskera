"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { Settings, LogOut } from "lucide-react";

type Props = {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl?: string | null;
    avatarEmoji?: string | null;
  } | null;
};

export function ProfileDropdown({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
        aria-label="Профиль и настройки"
        aria-expanded={open}
      >
        <UserAvatar user={user} size="sm" title={user.email} />
        <span className="max-w-[120px] truncate text-sm">
          {user.name ?? user.email}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          role="menu"
        >
          <div className="border-b border-[var(--asana-border-subtle)] px-3 py-2">
            <p className="truncate text-sm font-medium text-[var(--asana-text-primary)]">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-xs text-[var(--asana-text-placeholder)]">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
              role="menuitem"
            >
              <Settings className="h-4 w-4 shrink-0" aria-hidden />
              Настройки
            </Link>
            <form action="/api/auth/logout" method="POST" className="block">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
