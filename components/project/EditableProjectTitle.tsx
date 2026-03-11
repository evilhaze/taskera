"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

type Props = {
  projectId: string;
  projectName: string;
  isOwner: boolean;
};

export function EditableProjectTitle({
  projectId,
  projectName,
  isOwner
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(projectName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(projectName);
  }, [projectName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === projectName) {
      setEditing(false);
      setValue(projectName);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось сохранить");
        return;
      }
      setEditing(false);
      setValue(trimmed);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(projectName);
    setError(null);
    setEditing(false);
  }

  if (!isOwner) {
    return (
      <h1 className="page-title text-[var(--asana-text-primary)]">
        {projectName}
      </h1>
    );
  }

  if (editing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            maxLength={200}
            className="page-title min-w-0 flex-1 rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] px-2 py-1 text-[var(--asana-text-primary)] outline-none focus:ring-2 focus:ring-[var(--asana-blue)]/50"
            disabled={saving}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !value.trim()}
            className="btn-primary shrink-0 text-sm"
          >
            {saving ? "…" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="btn-secondary shrink-0 text-sm"
          >
            Отмена
          </button>
        </div>
        {error && (
          <p className="text-sm text-[var(--asana-red)]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="page-title text-[var(--asana-text-primary)]">
        {projectName}
      </h1>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 rounded p-1.5 text-[var(--asana-text-placeholder)] opacity-0 transition-opacity hover:bg-white/5 hover:text-[var(--asana-text-primary)] group-hover:opacity-100"
        aria-label="Редактировать название проекта"
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
