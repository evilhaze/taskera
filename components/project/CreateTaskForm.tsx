"use client";

import { FormEvent, useState } from "react";
import { PriorityBadge } from "@/components/priority/PriorityBadge";

type Member = { id: string; email: string; name: string | null };

const DEADLINE_ERROR_PAST =
  "Дедлайн не может быть раньше сегодняшнего дня. Укажите сегодняшнюю дату или позже.";
const DEADLINE_ERROR_FORMAT =
  "Введите дату в формате ДД/ММ/ГГГГ (например 25/12/2026).";

/** Парсит ДД/ММ/ГГГГ или ДД.ММ.ГГГГ, возвращает Date (полночь UTC) или null */
function parseDDMMYYYY(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10) - 1;
  const y = parseInt(year, 10);
  if (m < 0 || m > 11 || d < 1 || d > 31 || y < 2000 || y > 2100) return null;
  const date = new Date(Date.UTC(y, m, d));
  if (
    date.getUTCDate() !== d ||
    date.getUTCMonth() !== m ||
    date.getUTCFullYear() !== y
  )
    return null;
  return date;
}

function isDateBeforeToday(date: Date): boolean {
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  return day < startOfToday;
}

function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLInputElement).value.trim();
    const assigneeId = (form.elements.namedItem("assigneeId") as HTMLSelectElement).value || null;
    const deadlineRaw = (form.elements.namedItem("deadline") as HTMLInputElement).value.trim();

    let deadline: string | null = null;
    if (deadlineRaw) {
      const parsed = parseDDMMYYYY(deadlineRaw);
      if (!parsed) {
        setError(DEADLINE_ERROR_FORMAT);
        return;
      }
      if (isDateBeforeToday(parsed)) {
        setError(DEADLINE_ERROR_PAST);
        return;
      }
      deadline = toISODate(parsed);
    }

    setLoading(true);
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
          <input
            name="deadline"
            type="text"
            className="input-base"
            placeholder="ДД/ММ/ГГГГ"
            autoComplete="off"
          />
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
