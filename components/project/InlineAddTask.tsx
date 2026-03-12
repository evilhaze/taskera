"use client";

import { useState, useRef, useEffect } from "react";
import { openUpsellModal } from "@/components/demo/UpsellModal";

type Props = {
  projectId: string;
  status: string;
  onCreated: () => void;
  onCancel: () => void;
};

export function InlineAddTask({ projectId, status, onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || loading) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, status })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.upsell) openUpsellModal();
      return;
    }
    setTitle("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-card)] p-2 shadow-sm">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (!title.trim()) onCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Название задачи…"
        className="w-full rounded border-0 bg-transparent px-1.5 py-1 text-[13px] text-[var(--asana-text-primary)] placeholder:text-[var(--asana-text-placeholder)] focus:outline-none focus:ring-0"
        disabled={loading}
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="rounded bg-[var(--asana-blue)] px-2 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "…" : "Создать"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-2 py-1 text-[11px] text-[var(--asana-text-secondary)] hover:bg-white/5"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
