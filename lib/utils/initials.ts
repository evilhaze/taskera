/**
 * Инициалы для fallback-аватара: из name (первые буквы слов, макс. 2) или из email.
 */
export function getInitials(user: {
  name?: string | null;
  email: string;
}): string {
  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  const email = user.email.trim();
  if (!email) return "?";
  const local = email.split("@")[0];
  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase();
  }
  return local[0].toUpperCase();
}

/** Мягкие цвета фона для fallback-аватаров (по индексу от hash строки) */
const FALLBACK_COLORS = [
  "var(--avatar-fallback-1)",  // slate
  "var(--avatar-fallback-2)",  // blue
  "var(--avatar-fallback-3)",  // green
  "var(--avatar-fallback-4)",  // amber
  "var(--avatar-fallback-5)",  // violet
] as const;

/**
 * Детерминированный цвет фона по id/email для единообразия аватара пользователя.
 */
export function getAvatarFallbackColor(idOrEmail: string): string {
  let n = 0;
  for (let i = 0; i < idOrEmail.length; i++) {
    n = (n * 31 + idOrEmail.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[n % FALLBACK_COLORS.length];
}
