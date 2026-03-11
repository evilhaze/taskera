"use client";

import { FormEvent, useState } from "react";

type Member = { id: string; email: string; name: string | null };

type Props = {
  projectId: string;
  members: Member[];
};

export function CreateTaskForm({ projectId, members }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLInputElement).value.trim();
    const assigneeId = (form.elements.namedItem("assigneeId") as HTMLSelectElement).value || null;
    const deadlineRaw = (form.elements.namedItem("deadline") as HTMLInputElement).value;
    const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;
    const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value as "LOW" | "MEDIUM" | "HIGH";

    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        assigneeId,
        deadline,
        priority
      })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? "Не удалось создать задачу");
      return;
    }

    form.reset();
    window.dispatchEvent(new CustomEvent("task-created", { detail: data }));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="text-md font-medium text-slate-200 mb-3">Новая задача</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-400 mb-1">Название *</label>
          <input
            name="title"
            type="text"
            required
            maxLength={500}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Краткое название"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-400 mb-1">Описание</label>
          <textarea
            name="description"
            rows={2}
            maxLength={5000}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            placeholder="Подробности (необязательно)"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Исполнитель</label>
          <select
            name="assigneeId"
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">— Не назначен —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.email}
                {m.name ? ` (${m.name})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Дедлайн</label>
          <input
            name="deadline"
            type="datetime-local"
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Приоритет</label>
          <select
            name="priority"
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-70"
      >
        {loading ? "Создание…" : "Создать задачу"}
      </button>
    </form>
  );
}
