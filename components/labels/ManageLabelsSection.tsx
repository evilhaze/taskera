"use client";

import { useState, useEffect, useCallback } from "react";
import { LabelBadge, type LabelShape } from "./LabelBadge";
import { CreateLabelForm } from "./CreateLabelForm";

type Props = {
  projectId: string;
  className?: string;
};

export function ManageLabelsSection({ projectId, className = "" }: Props) {
  const [labels, setLabels] = useState<LabelShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/labels`);
    if (!res.ok) return;
    const data = await res.json();
    setLabels(data);
  }, [projectId]);

  useEffect(() => {
    fetchLabels().finally(() => setLoading(false));
  }, [fetchLabels]);

  function handleCreated(label: LabelShape) {
    setLabels((prev) => [...prev, label]);
    setShowCreate(false);
  }

  async function handleDelete(labelId: string) {
    setDeletingId(labelId);
    setError(null);
    try {
      const res = await fetch(`/api/labels/${labelId}`, { method: "DELETE" });
      if (res.ok) {
        setLabels((prev) => prev.filter((l) => l.id !== labelId));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Не удалось удалить метку");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Метки проекта</h2>
        {!showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn-secondary text-sm"
          >
            Добавить метку
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
        Метки можно назначать задачам на доске и в карточке задачи.
      </p>
      {error && (
        <p className="mt-2 text-sm text-[var(--asana-red)]">{error}</p>
      )}
      {showCreate && (
        <div className="mt-4 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] p-4">
          <CreateLabelForm
            projectId={projectId}
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}
      <div className="mt-4">
        {loading ? (
          <div className="h-10 w-48 animate-pulse rounded bg-[var(--asana-bg-input)]" />
        ) : labels.length === 0 && !showCreate ? (
          <p className="text-sm text-[var(--asana-text-placeholder)]">
            Нет меток. Создайте первую, чтобы назначать их задачам.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <li
                key={label.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-3 py-2"
              >
                <LabelBadge label={label} />
                <button
                  type="button"
                  onClick={() => handleDelete(label.id)}
                  disabled={deletingId !== null}
                  className="rounded p-1 text-[var(--asana-text-placeholder)] hover:bg-[var(--asana-red)]/10 hover:text-[var(--asana-red)] disabled:opacity-50"
                  aria-label={`Удалить метку ${label.name}`}
                >
                  {deletingId === label.id ? (
                    <span className="h-4 w-4 animate-spin">…</span>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
