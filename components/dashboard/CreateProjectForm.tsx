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

    router.push(`/projects/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Новый проект</h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="project-name" className="block text-sm text-slate-400 mb-1">
            Название
          </label>
          <input
            id="project-name"
            name="name"
            type="text"
            required
            maxLength={200}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Например: Веб-сайт"
          />
        </div>
        <div>
          <label htmlFor="project-desc" className="block text-sm text-slate-400 mb-1">
            Описание (необязательно)
          </label>
          <textarea
            id="project-desc"
            name="description"
            rows={2}
            maxLength={2000}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            placeholder="Кратко о проекте"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-70"
        >
          {loading ? "Создание…" : "Создать проект"}
        </button>
      </div>
    </form>
  );
}
