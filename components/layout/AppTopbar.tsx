import Link from "next/link";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserAvatar } from "@/components/avatar/UserAvatar";

type Props = {
  user: { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null } | null;
};

export function AppTopbar({ user }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--asana-border-subtle)] bg-[var(--asana-bg-app)] px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="btn-create inline-flex items-center gap-1.5 text-sm"
        >
          <span aria-hidden>+</span>
          Создать
        </Link>
        <div className="h-6 w-px bg-[var(--asana-border-subtle)]" />
        <div className="flex h-9 w-64 items-center rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] px-3 text-sm text-[var(--asana-text-placeholder)]">
          Поиск
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <form action="/api/auth/logout" method="POST" className="inline">
          <button
            type="submit"
            className="btn-secondary text-sm"
          >
            Выйти
          </button>
        </form>
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1">
          {user && (
            <Link
              href="/settings/profile"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              title="Настройки профиля"
            >
              <UserAvatar user={user} size="sm" title={user.email} />
              <span className="max-w-[120px] truncate text-sm text-[var(--asana-text-secondary)]">
                {user?.name ?? user?.email}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
