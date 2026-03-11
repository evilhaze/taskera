"use client";

import { useState, FormEvent } from "react";
import { LABEL_COLORS_LIST } from "@/lib/validations/label";
import type { LabelShape } from "./LabelBadge";

const COLOR_VAR_MAP: Record<string, string> = {
  gray: "var(--label-gray-bg)",
  blue: "var(--label-blue-bg)",
  green: "var(--label-green-bg)",
  yellow: "var(--label-yellow-bg)",
  orange: "var(--label-orange-bg)",
  red: "var(--label-red-bg)",
  purple: "var(--label-purple-bg)",
  pink: "var(--label-pink-bg)"
};

type Props = {
  projectId: string;
  onCreated: (label: LabelShape) => void;
  onCancel?: () => void;
  className?: string;
};

export function CreateLabelForm({
  projectId,
  onCreated,
  onCancel,
  className = ""
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(LABEL_COLORS_LIST[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, color })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось создать метку");
        return;
      }
      onCreated(data as LabelShape);
      setName("");
      setColor(LABEL_COLORS_LIST[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--asana-text-secondary)]">
          Название
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Метка"
          maxLength={100}
          className="input-base"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
          Цвет
        </label>
        <div className="flex flex-wrap gap-2">
          {LABEL_COLORS_LIST.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                color === c
                  ? "border-[var(--asana-text-primary)] ring-2 ring-[var(--asana-blue)]/40"
                  : "border-transparent hover:border-[var(--asana-border)]"
              }`}
              style={{ backgroundColor: COLOR_VAR_MAP[c] ?? COLOR_VAR_MAP.gray }}
              title={c}
              aria-label={`Цвет ${c}`}
            />
          ))}
        </div>
      </div>
      {error && (
        <p className="text-xs text-[var(--asana-red)]">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn-primary"
        >
          {submitting ? "…" : "Создать"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
