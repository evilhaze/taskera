"use client";

import { Filter, Search } from "lucide-react";
import { LabelBadge, type LabelShape } from "@/components/labels/LabelBadge";

const STATUS_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "TODO", label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "REVIEW", label: "На проверке" },
  { value: "DONE", label: "Готово" }
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Все приоритеты" },
  { value: "HIGH", label: "Высокий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "LOW", label: "Низкий" }
];

type Member = { id: string; email: string; name: string | null };

type Props = {
  labels: LabelShape[];
  members: Member[];
  selectedLabelId: string | null;
  selectedAssigneeId: string | null;
  selectedStatus: string;
  selectedPriority: string;
  searchQuery: string;
  onLabelChange: (id: string | null) => void;
  onAssigneeChange: (id: string | null) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function TasksToolbar({
  labels,
  members,
  selectedLabelId,
  selectedAssigneeId,
  selectedStatus,
  selectedPriority,
  searchQuery,
  onLabelChange,
  onAssigneeChange,
  onStatusChange,
  onPriorityChange,
  onSearchChange
}: Props) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] px-2 py-1.5">
        <Filter className="h-3.5 w-3.5 text-[var(--asana-text-placeholder)]" aria-hidden />
        <span className="text-[11px] font-medium text-[var(--asana-text-secondary)]">Метка:</span>
        <button
          type="button"
          onClick={() => onLabelChange(null)}
          className={`rounded px-1.5 py-0.5 text-[11px] ${selectedLabelId === null ? "bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]" : "text-[var(--asana-text-placeholder)] hover:text-[var(--asana-text-secondary)]"}`}
        >
          Все
        </button>
        {labels.slice(0, 5).map((label) => (
          <button
            key={label.id}
            type="button"
            onClick={() => onLabelChange(selectedLabelId === label.id ? null : label.id)}
            className={`rounded px-1 py-0.5 ${selectedLabelId === label.id ? "ring-1 ring-[var(--asana-blue)]" : ""}`}
          >
            <LabelBadge label={label} small />
          </button>
        ))}
        {labels.length > 5 && (
          <span className="text-[10px] text-[var(--asana-text-placeholder)]">+{labels.length - 5}</span>
        )}
      </div>

      <select
        value={selectedAssigneeId ?? ""}
        onChange={(e) => onAssigneeChange(e.target.value || null)}
        className="h-8 min-w-[120px] rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] pl-2 pr-6 text-[11px] text-[var(--asana-text-primary)] focus:border-[var(--asana-blue)] focus:outline-none"
        title="Исполнитель"
      >
        <option value="">Все</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.email}</option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-8 min-w-[100px] rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] pl-2 pr-6 text-[11px] text-[var(--asana-text-primary)] focus:border-[var(--asana-blue)] focus:outline-none"
        title="Статус"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value || "all"} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="h-8 min-w-[100px] rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] pl-2 pr-6 text-[11px] text-[var(--asana-text-primary)] focus:border-[var(--asana-blue)] focus:outline-none"
        title="Приоритет"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value || "all"} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="relative flex-1 min-w-[140px] max-w-[200px]">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--asana-text-placeholder)]" aria-hidden />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск задач…"
          className="h-8 w-full rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] py-1 pl-7 pr-2 text-[11px] text-[var(--asana-text-primary)] placeholder:text-[var(--asana-text-placeholder)] focus:border-[var(--asana-blue)] focus:outline-none"
        />
      </div>
    </div>
  );
}
