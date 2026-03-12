"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddMemberForm } from "./AddMemberForm";
import { UserAvatar } from "@/components/avatar/UserAvatar";

type Member = {
  id: string;
  userId: string;
  user: { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null };
};

type Props = {
  projectId: string;
  members: Member[];
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
  isDemo?: boolean;
};

export function MembersSection({
  projectId,
  members,
  ownerId,
  currentUserId,
  isOwner,
  isDemo = false
}: Props) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(userId: string) {
    setError(null);
    setRemovingId(userId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось выполнить действие");
        return;
      }
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  function onMemberAdded() {
    router.refresh();
  }

  return (
    <section>
      <h2 className="section-title mb-4">Участники</h2>
      {error && (
        <div className="mb-4 rounded-md border border-[var(--asana-red)]/50 bg-[var(--asana-red)]/10 px-3 py-2.5">
          <p className="text-sm text-[var(--asana-red)]">{error}</p>
        </div>
      )}
      <div className="card overflow-hidden divide-y divide-[var(--asana-border-subtle)]">
        {members.map((m) => {
          const isMemberOwner = m.userId === ownerId;
          const isCurrentUser = m.userId === currentUserId;
          const canRemove = isOwner && !isMemberOwner;
          const canLeave = isCurrentUser && !isMemberOwner;

          return (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar user={m.user} size="sm" />
                <div>
                  <span className="text-[var(--asana-text-primary)]">{m.user.email}</span>
                  {m.user.name && (
                    <span className="ml-2 text-sm text-[var(--asana-text-secondary)]">
                      {m.user.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-[var(--asana-text-secondary)]">
                  {isMemberOwner ? "Владелец" : "Участник"}
                </span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--asana-red)] hover:bg-[var(--asana-red)]/10 transition-colors disabled:opacity-50"
                  >
                    {removingId === m.userId ? "…" : "Удалить"}
                  </button>
                )}
                {canLeave && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors disabled:opacity-50"
                  >
                    {removingId === m.userId ? "…" : "Покинуть"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {isDemo && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Недоступно в демо
              </span>
            )}
          </div>
          <AddMemberForm
            projectId={projectId}
            onSuccess={onMemberAdded}
            isDemo={isDemo}
          />
        </div>
      )}
    </section>
  );
}
