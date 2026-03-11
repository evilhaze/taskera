"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { ProgressBar } from "@/components/ui/ProgressBar";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
};

function TeamMemberCard({ member }: { member: TeamMember }) {
  const progressPercent =
    member.totalTasks > 0
      ? Math.round((member.completedTasks / member.totalTasks) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5 transition-colors hover:border-[var(--asana-border)]">
      <div className="flex items-start gap-4">
        <UserAvatar
          user={{
            id: member.id,
            email: member.email,
            name: member.name,
            avatarUrl: member.avatarUrl,
            avatarEmoji: member.avatarEmoji
          }}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--asana-text-primary)] truncate">
            {member.name ?? member.email}
          </h3>
          <p className="mt-0.5 truncate text-sm text-[var(--asana-text-placeholder)]">
            {member.email}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--asana-text-secondary)]">
            <span>
              <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                {member.totalTasks}
              </span>{" "}
              задач
            </span>
            <span>
              <span className="font-medium tabular-nums text-emerald-400">
                {member.completedTasks}
              </span>{" "}
              выполнено
            </span>
            <span>
              <span className="font-medium tabular-nums text-[var(--asana-blue)]">
                {member.inProgressTasks}
              </span>{" "}
              в работе
            </span>
            {member.overdueTasks > 0 && (
              <span>
                <span className="font-medium tabular-nums text-[var(--asana-red)]">
                  {member.overdueTasks}
                </span>{" "}
                просрочено
              </span>
            )}
          </div>
          {member.totalTasks > 0 && (
            <div className="mt-4">
              <ProgressBar
                value={progressPercent}
                size="sm"
                showPercent
                className="[--progress-track:var(--asana-bg-input)]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="page-title text-[var(--asana-text-primary)]">
            Команда
          </h1>
          <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
            Участники ваших проектов и их нагрузка
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Команда
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          Участники ваших проектов и их нагрузка
        </p>
      </header>

      <section>
        <h2 className="section-title mb-4">Участники</h2>
        {members.length === 0 ? (
          <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-16 text-center">
            <p className="text-[var(--asana-text-secondary)]">
              Нет участников в проектах
            </p>
            <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
              Добавьте участников в проекты, чтобы они отображались здесь
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {members.map((member) => (
              <li key={member.id}>
                <TeamMemberCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
