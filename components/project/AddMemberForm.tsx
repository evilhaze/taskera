"use client";

import { FormEvent, useState } from "react";

type Props = { projectId: string };

export function AddMemberForm({ projectId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
      setError(data.message ?? "Не удалось добавить участника");
      return;
    }

    setSuccess(`Участник ${data.email} добавлен. Обновите страницу, чтобы увидеть список.`);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="member-email" className="block text-sm text-slate-400 mb-1">
          Добавить по email
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-70"
      >
        {loading ? "Добавление…" : "Добавить"}
      </button>
      {error && (
        <p className="w-full text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="w-full text-sm text-green-400">{success}</p>
      )}
    </form>
  );
}
