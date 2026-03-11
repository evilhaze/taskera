"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddMemberForm } from "./AddMemberForm";

type Member = {
  id: string;
  userId: string;
  user: { id: string; email: string; name: string | null };
};

type Props = {
  projectId: string;
  members: Member[];
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
};

export function MembersSection({
  projectId,
  members,
  ownerId,
  currentUserId,
  isOwner
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
        <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2.5">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      <div className="card overflow-hidden divide-y divide-zinc-800/80">
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
              <div className="min-w-0">
                <span className="text-zinc-200">{m.user.email}</span>
                {m.user.name && (
                  <span className="ml-2 text-sm text-zinc-500">
                    {m.user.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-zinc-500">
                  {isMemberOwner ? "Владелец" : "Участник"}
                </span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    {removingId === m.userId ? "…" : "Удалить"}
                  </button>
                )}
                {canLeave && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors disabled:opacity-50"
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
          <AddMemberForm projectId={projectId} onSuccess={onMemberAdded} />
        </div>
      )}
    </section>
  );
}
