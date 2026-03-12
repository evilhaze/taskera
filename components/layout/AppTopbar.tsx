import Link from "next/link";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { AIAssistantTrigger } from "@/components/ai/AIAssistantTrigger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Props = {
  user: { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null } | null;
};

export function AppTopbar({ user }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--asana-border-subtle)] bg-[var(--asana-bg-app)] px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/app/dashboard?create=project"
          className="btn-create inline-flex items-center gap-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--asana-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--asana-bg-app)]"
        >
          <span aria-hidden>+</span>
          Создать
        </Link>
        <div className="h-6 w-px bg-[var(--asana-border-subtle)]" />
        <form action="/search" method="GET" className="flex-1 max-w-xs">
          <label htmlFor="global-search" className="sr-only">
            Поиск проектов, задач и участников
          </label>
          <input
            id="global-search"
            name="q"
            type="search"
            placeholder="Поиск проектов, задач и участников..."
            className="h-9 w-64 rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] px-3 text-sm text-[var(--asana-text-primary)] placeholder:text-[var(--asana-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--asana-border)] focus:ring-offset-1 focus:ring-offset-[var(--asana-bg-app)]"
            autoComplete="off"
          />
        </form>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <AIAssistantTrigger />
        <NotificationDropdown />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
