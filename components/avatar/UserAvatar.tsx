"use client";

import { getInitials, getAvatarFallbackColor } from "@/lib/utils/initials";

export type UserAvatarUser = {
  id?: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  avatarEmoji?: string | null;
};

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-sm"
} as const;

const EMOJI_SIZE_CLASSES = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl"
} as const;

type Size = keyof typeof SIZE_CLASSES;

type Props = {
  user: UserAvatarUser | null;
  size?: Size;
  className?: string;
  title?: string;
};

export function UserAvatar({ user, size = "md", className = "", title }: Props) {
  const s = SIZE_CLASSES[size];

  if (!user) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] text-[var(--asana-text-placeholder)] ${s} ${className}`}
        title={title ?? "Не назначен"}
        aria-hidden
      >
        —
      </span>
    );
  }

  const initials = getInitials(user);
  const fallbackBg = getAvatarFallbackColor(user.id ?? user.email);

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={`inline-block shrink-0 rounded-full object-cover ring-1 ring-[var(--asana-border-subtle)] ${s} ${className}`}
        title={title ?? user.name ?? user.email}
      />
    );
  }

  if (user.avatarEmoji) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] ${s} ${EMOJI_SIZE_CLASSES[size]} ${className}`}
        title={title ?? user.name ?? user.email}
        aria-hidden
      >
        {user.avatarEmoji}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-[var(--asana-border-subtle)] ${s} ${className}`}
      style={{ backgroundColor: fallbackBg }}
      title={title ?? user.name ?? user.email}
      aria-hidden
    >
      {initials}
    </span>
  );
}
