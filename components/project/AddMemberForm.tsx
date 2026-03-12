"use client";

import { FormEvent, useState } from "react";
import { openDemoInviteBlockedModal } from "@/components/demo/DemoInviteBlockedModal";

type Props = { projectId: string; onSuccess?: () => void; isDemo?: boolean };

export function AddMemberForm({ projectId, onSuccess, isDemo = false }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isDemo) {
      openDemoInviteBlockedModal();
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      if (res.status === 403 && data.upsell) {
        openDemoInviteBlockedModal();
      }
      setError(data.message ?? "Не удалось добавить участника");
      return;
    }

    setSuccess(`Участник ${data.email} добавлен.`);
    form.reset();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <label
          htmlFor="member-email"
          className="block text-sm font-medium text-[var(--asana-text-secondary)]"
        >
          Добавить по email
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="input-base"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Добавление…" : "Добавить"}
      </button>
      {error && (
        <p className="w-full text-sm text-[var(--asana-red)]">{error}</p>
      )}
      {success && (
        <p className="w-full text-sm text-[var(--asana-green)]">{success}</p>
      )}
    </form>
  );
}
