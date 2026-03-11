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
    <section className="mb-8">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Участники</h2>
      {error && (
        <p className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <ul className="rounded-lg border border-slate-700 bg-slate-900/50 divide-y divide-slate-700">
        {members.map((m) => {
          const isMemberOwner = m.userId === ownerId;
          const isCurrentUser = m.userId === currentUserId;
          const canRemove =
            isOwner && !isMemberOwner;
          const canLeave =
            isCurrentUser && !isMemberOwner;

          return (
            <li
              key={m.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <span className="text-slate-200">{m.user.email}</span>
                {m.user.name && (
                  <span className="ml-2 text-slate-500 text-sm">
                    {m.user.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">
                  {isMemberOwner ? "Владелец" : "Участник"}
                </span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-950/60 hover:text-red-200 disabled:opacity-50"
                  >
                    {removingId === m.userId ? "…" : "Удалить"}
                  </button>
                )}
                {canLeave && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    disabled={removingId !== null}
                    className="rounded px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50"
                  >
                    {removingId === m.userId ? "…" : "Покинуть"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isOwner && (
        <div className="mt-4">
          <AddMemberForm projectId={projectId} onSuccess={onMemberAdded} />
        </div>
      )}
    </section>
  );
}
