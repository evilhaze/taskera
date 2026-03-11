"use client";

import { FormEvent, useState } from "react";
import { PriorityBadge } from "@/components/priority/PriorityBadge";

type Member = { id: string; email: string; name: string | null };

type Props = {
  projectId: string;
  members: Member[];
};

export function CreateTaskForm({ projectId, members }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

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
    setPriority("MEDIUM");
    window.dispatchEvent(new CustomEvent("task-created", { detail: data }));
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <h3 className="text-base font-medium text-[var(--asana-text-primary)] mb-4">Новая задача</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-[var(--asana-text-secondary)]">
            Название *
          </label>
          <input
            name="title"
            type="text"
            required
            maxLength={500}
            className="input-base"
            placeholder="Краткое название"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-[var(--asana-text-secondary)]">
            Описание
          </label>
          <textarea
            name="description"
            rows={2}
            maxLength={5000}
            className="input-base resize-none"
            placeholder="Подробности (необязательно)"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--asana-text-secondary)]">
            Исполнитель
          </label>
          <select name="assigneeId" className="input-base">
            <option value="">— Не назначен —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.email}
                {m.name ? ` (${m.name})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--asana-text-secondary)]">
            Дедлайн
          </label>
          <input name="deadline" type="datetime-local" className="input-base" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--asana-text-secondary)]">
            Приоритет
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={priority} size="md" showLabel />
            <select
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
              className="input-base flex-1 min-w-[120px]"
            >
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
            </select>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-md border border-[var(--asana-red)]/50 bg-[var(--asana-red)]/10 px-3 py-2.5">
          <p className="text-sm text-[var(--asana-red)]">{error}</p>
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary mt-4">
        {loading ? "Создание…" : "Создать задачу"}
      </button>
    </form>
  );
}
