import { UserAvatar } from "@/components/avatar/UserAvatar";

type UserWorkload = {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalTasks: number;
  overdueTasks: number;
  doneTasks: number;
  activeTasks: number;
};

type Props = {
  items: UserWorkload[];
};

export function WorkloadList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5">
        <h3 className="text-sm font-medium text-[var(--asana-text-secondary)]">
          Нагрузка по участникам
        </h3>
        <p className="mt-2 text-sm text-[var(--asana-text-placeholder)]">
          Нет назначенных задач
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5">
      <h3 className="text-sm font-medium text-[var(--asana-text-secondary)] mb-4">
        Нагрузка по участникам
      </h3>
      <ul className="space-y-3">
        {items.map((u) => (
          <li
            key={u.userId}
            className="flex items-center gap-3 rounded-lg border border-[var(--asana-border-subtle)]/50 bg-[var(--asana-bg-input)]/30 px-3 py-2.5"
          >
            <UserAvatar
              user={{
                id: u.userId,
                email: u.userEmail,
                name: u.userName,
                avatarUrl: null,
                avatarEmoji: null
              }}
              size="sm"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--asana-text-primary)]">
                {u.userName ?? u.userEmail}
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-0 text-xs text-[var(--asana-text-placeholder)]">
                <span>всего: {u.totalTasks}</span>
                {u.overdueTasks > 0 && (
                  <span className="text-[var(--asana-red)]">
                    просрочено: {u.overdueTasks}
                  </span>
                )}
                <span>выполнено: {u.doneTasks}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-lg font-semibold tabular-nums text-[var(--asana-text-primary)]">
                {u.totalTasks}
              </span>
              <p className="text-[10px] text-[var(--asana-text-placeholder)]">
                задач
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
