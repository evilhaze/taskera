import Link from "next/link";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

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
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
