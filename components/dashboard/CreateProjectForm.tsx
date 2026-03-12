"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLInputElement).value.trim();

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? "Не удалось создать проект");
      return;
    }

    router.push(`/app/projects/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <h2 className="section-title mb-4">Новый проект</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="project-name"
            className="block text-sm font-medium text-[var(--asana-text-secondary)]"
          >
            Название
          </label>
          <input
            id="project-name"
            name="name"
            type="text"
            required
            maxLength={200}
            className="input-base"
            placeholder="Например: Веб-сайт"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="project-desc"
            className="block text-sm font-medium text-[var(--asana-text-secondary)]"
          >
            Описание (необязательно)
          </label>
          <textarea
            id="project-desc"
            name="description"
            rows={2}
            maxLength={2000}
            className="input-base resize-none"
            placeholder="Кратко о проекте"
          />
        </div>
        {error && (
          <div className="rounded-md border border-[var(--asana-red)]/50 bg-[var(--asana-red)]/10 px-3 py-2.5">
            <p className="text-sm text-[var(--asana-red)]">{error}</p>
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Создание…" : "Создать проект"}
        </button>
      </div>
    </form>
  );
}
