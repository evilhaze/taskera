"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LabelBadge, type LabelShape } from "./LabelBadge";

type Props = {
  projectId: string;
  taskId: string;
  selectedLabels: LabelShape[];
  onUpdate: (labels: LabelShape[]) => void;
  disabled?: boolean;
  className?: string;
};

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

type ToastState = "visible" | "leaving" | null;

export function LabelPicker({
  projectId,
  taskId,
  selectedLabels,
  onUpdate,
  disabled = false,
  className = ""
}: Props) {
  const [projectLabels, setProjectLabels] = useState<LabelShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [patching, setPatching] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLabels = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/labels`);
    if (!res.ok) return;
    const data = await res.json();
    setProjectLabels(data);
  }, [projectId]);

  useEffect(() => {
    fetchLabels().finally(() => setLoading(false));
  }, [fetchLabels]);

  useEffect(() => {
    if (toast === "visible") {
      toastTimeoutRef.current = setTimeout(() => setToast("leaving"), 2000);
      return () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      };
    }
    if (toast === "leaving") {
      toastTimeoutRef.current = setTimeout(() => setToast(null), 300);
      return () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      };
    }
  }, [toast]);

  const selectedIds = new Set(selectedLabels.map((l) => l.id));

  async function toggleLabel(label: LabelShape) {
    if (disabled || patching) return;
    const nextIds = selectedIds.has(label.id)
      ? selectedLabels.filter((l) => l.id !== label.id).map((l) => l.id)
      : [...selectedLabels.map((l) => l.id), label.id];
    setPatching(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelIds: nextIds })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.labels)) {
        onUpdate(data.labels);
        setToast("visible");
      }
    } finally {
      setPatching(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      {toast !== null && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-3 py-2 text-xs font-medium text-[var(--asana-text-primary)] shadow-lg transition-opacity duration-300 ${
            toast === "leaving" ? "opacity-0" : "opacity-100"
          }`}
        >
          Успешно сохранено!
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedLabels.map((label) => (
          <LabelBadge
            key={label.id}
            label={label}
            small
            onRemove={disabled || patching ? undefined : () => toggleLabel(label)}
          />
        ))}
        {!loading && projectLabels.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            disabled={disabled}
            className="rounded-md border border-dashed border-[var(--asana-border)] px-2 py-1 text-xs text-[var(--asana-text-secondary)] hover:border-[var(--asana-text-placeholder)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] disabled:opacity-50"
          >
            {open ? "Скрыть" : "Добавить метку"}
          </button>
        )}
      </div>
      {open && projectLabels.length > 0 && (
        <div className="mt-2 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] p-2">
          <p className="mb-2 text-xs text-[var(--asana-text-secondary)]">
            Выберите метки для задачи
          </p>
          <div className="flex flex-wrap gap-1.5">
            {projectLabels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label)}
                disabled={patching}
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  selectedIds.has(label.id)
                    ? "border-[var(--asana-blue)] bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]"
                    : "border-transparent bg-[var(--asana-bg-card)] text-[var(--asana-text-secondary)] hover:bg-[var(--asana-bg-card-hover)]"
                }`}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: COLOR_VAR_MAP[label.color] ?? COLOR_VAR_MAP.gray
                  }}
                />
                {label.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
