"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  PlusCircle,
  FileText,
  ListTodo,
  BarChart3,
  Loader2,
  Check
} from "lucide-react";

type TabId = "create" | "improve" | "subtasks" | "summary";

type Project = { id: string; name: string };

type CreateTaskDraft = {
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeNameOrEmail: string | null;
  deadline: string | null;
  priority: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialProjectId?: string | null;
  initialTask?: { id: string; title: string; description: string | null } | null;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
};

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "create", label: "Создать задачу", icon: <PlusCircle className="h-4 w-4" /> },
  { id: "improve", label: "Улучшить описание", icon: <FileText className="h-4 w-4" /> },
  { id: "subtasks", label: "Подзадачи", icon: <ListTodo className="h-4 w-4" /> },
  { id: "summary", label: "Резюме проекта", icon: <BarChart3 className="h-4 w-4" /> }
];

export function AIAssistantPanel({
  open,
  onClose,
  initialProjectId,
  initialTask,
  onTaskCreated,
  onTaskUpdated
}: Props) {
  const [tab, setTab] = useState<TabId>("create");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [createPrompt, setCreatePrompt] = useState("");
  const [createProjectId, setCreateProjectId] = useState(initialProjectId ?? "");
  const [createLoading, setCreateLoading] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateTaskDraft | null>(null);
  const [createConfirming, setCreateConfirming] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [improveTaskId, setImproveTaskId] = useState(initialTask?.id ?? "");
  const [improveTitle, setImproveTitle] = useState(initialTask?.title ?? "");
  const [improveDescription, setImproveDescription] = useState(
    initialTask?.description ?? ""
  );
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveResult, setImproveResult] = useState<string | null>(null);
  const [improveConfirming, setImproveConfirming] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);

  const [subtasksTitle, setSubtasksTitle] = useState(initialTask?.title ?? "");
  const [subtasksDescription, setSubtasksDescription] = useState(
    initialTask?.description ?? ""
  );
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [subtasksResult, setSubtasksResult] = useState<string[] | null>(null);
  const [subtasksError, setSubtasksError] = useState<string | null>(null);

  const [summaryProjectId, setSummaryProjectId] = useState(
    initialProjectId ?? ""
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{
    summary: string;
    risks: string[];
    recommendations: string[];
  } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (open && projects.length === 0) {
      setLoadingProjects(true);
      fetch("/api/projects")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const list = Array.isArray(data)
            ? data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))
            : [];
          setProjects(list);
          if (list.length > 0 && !createProjectId) setCreateProjectId(list[0].id);
          if (list.length > 0 && !summaryProjectId) setSummaryProjectId(list[0].id);
        })
        .finally(() => setLoadingProjects(false));
    }
  }, [open, projects.length, createProjectId, summaryProjectId]);

  useEffect(() => {
    if (initialProjectId) {
      setCreateProjectId(initialProjectId);
      setSummaryProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  useEffect(() => {
    if (initialTask) {
      setImproveTaskId(initialTask.id);
      setImproveTitle(initialTask.title);
      setImproveDescription(initialTask.description ?? "");
      setSubtasksTitle(initialTask.title);
      setSubtasksDescription(initialTask.description ?? "");
    }
  }, [initialTask?.id, initialTask?.title, initialTask?.description]);

  async function handleCreateGenerate() {
    if (!createPrompt.trim() || !createProjectId) return;
    setCreateError(null);
    setCreateDraft(null);
    setCreateLoading(true);
    try {
      const res = await fetch("/api/ai/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: createProjectId, prompt: createPrompt.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Ошибка");
      setCreateDraft(data.draft);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Не удалось сгенерировать");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleCreateConfirm() {
    if (!createDraft || !createProjectId) return;
    setCreateConfirming(true);
    setCreateError(null);
    try {
      const res = await fetch(`/api/projects/${createProjectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createDraft.title,
          description: createDraft.description,
          assigneeId: createDraft.assigneeId,
          deadline: createDraft.deadline,
          priority: createDraft.priority,
          status: createDraft.status
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Ошибка создания");
      setCreateDraft(null);
      setCreatePrompt("");
      onTaskCreated?.();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Не удалось создать задачу");
    } finally {
      setCreateConfirming(false);
    }
  }

  async function handleImproveGenerate() {
    const useTaskId = improveTaskId.trim();
    const useTitle = improveTitle.trim();
    if (useTaskId || useTitle) {
      setImproveError(null);
      setImproveResult(null);
      setImproveLoading(true);
      try {
        const res = await fetch("/api/ai/improve-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: useTaskId
            ? JSON.stringify({ taskId: useTaskId })
            : JSON.stringify({
                title: useTitle,
                description: improveDescription.trim() || null
              })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "Ошибка");
        setImproveResult(data.description);
      } catch (e) {
        setImproveError(e instanceof Error ? e.message : "Не удалось сгенерировать");
      } finally {
        setImproveLoading(false);
      }
    }
  }

  async function handleImproveConfirm() {
    if (!improveResult) return;
    if (improveTaskId) {
      setImproveConfirming(true);
      setImproveError(null);
      try {
        const res = await fetch(`/api/tasks/${improveTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: improveResult })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "Ошибка");
        setImproveResult(null);
        onTaskUpdated?.();
      } catch (e) {
        setImproveError(e instanceof Error ? e.message : "Не удалось сохранить");
      } finally {
        setImproveConfirming(false);
      }
    }
  }

  async function handleSubtasksGenerate() {
    if (!subtasksTitle.trim()) return;
    setSubtasksError(null);
    setSubtasksResult(null);
    setSubtasksLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: subtasksTitle.trim(),
          description: subtasksDescription.trim() || null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Ошибка");
      setSubtasksResult(data.subtasks ?? []);
    } catch (e) {
      setSubtasksError(e instanceof Error ? e.message : "Не удалось сгенерировать");
    } finally {
      setSubtasksLoading(false);
    }
  }

  async function handleSummaryGenerate() {
    if (!summaryProjectId) return;
    setSummaryError(null);
    setSummaryResult(null);
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/project-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: summaryProjectId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Ошибка");
      setSummaryResult(data);
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : "Не удалось сгенерировать");
    } finally {
      setSummaryLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--asana-border-subtle)] bg-[var(--asana-bg-app)] shadow-xl"
        role="dialog"
        aria-label="AI Assistant"
      >
        <div className="flex items-center justify-between border-b border-[var(--asana-border-subtle)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--asana-blue)]" aria-hidden />
            <h2 className="text-lg font-semibold text-[var(--asana-text-primary)]">
              AI Assistant
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--asana-text-placeholder)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-[var(--asana-border-subtle)] px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-t-md px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white/10 text-[var(--asana-text-primary)]"
                  : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "create" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--asana-text-secondary)]">
                Опишите задачу своими словами. Укажите исполнителя, дедлайн и приоритет при необходимости.
              </p>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-sm text-[var(--asana-text-placeholder)]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Загрузка проектов…
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                    Проект
                  </label>
                  <select
                    value={createProjectId}
                    onChange={(e) => setCreateProjectId(e.target.value)}
                    className="input-base w-full"
                  >
                    <option value="">Выберите проект</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                  Запрос
                </label>
                <textarea
                  value={createPrompt}
                  onChange={(e) => setCreatePrompt(e.target.value)}
                  placeholder="Например: Сделай редизайн страницы логина, назначь Алекса, дедлайн 20 марта, высокий приоритет"
                  rows={3}
                  className="input-base w-full resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateGenerate}
                disabled={createLoading || !createPrompt.trim() || !createProjectId}
                className="btn-primary inline-flex items-center gap-2"
              >
                {createLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Сгенерировать
              </button>
              {createError && (
                <p className="text-sm text-[var(--asana-red)]">{createError}</p>
              )}
              {createDraft && (
                <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                    Черновик задачи
                  </p>
                  <p className="font-medium text-[var(--asana-text-primary)]">
                    {createDraft.title}
                  </p>
                  {createDraft.description && (
                    <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
                      {createDraft.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--asana-text-placeholder)]">
                    <span>{createDraft.priority}</span>
                    <span>{createDraft.status}</span>
                    {createDraft.deadline && <span>Дедлайн: {createDraft.deadline}</span>}
                    {createDraft.assigneeNameOrEmail && (
                      <span>Исполнитель: {createDraft.assigneeNameOrEmail}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateConfirm}
                    disabled={createConfirming}
                    className="btn-primary mt-4 inline-flex items-center gap-2"
                  >
                    {createConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Создать задачу
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "improve" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--asana-text-secondary)]">
                Укажите задачу по ID или введите название и описание — AI предложит улучшенное описание.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                  ID задачи (если есть)
                </label>
                <input
                  type="text"
                  value={improveTaskId}
                  onChange={(e) => setImproveTaskId(e.target.value)}
                  placeholder="Оставьте пустым, чтобы ввести вручную"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                  Название
                </label>
                <input
                  type="text"
                  value={improveTitle}
                  onChange={(e) => setImproveTitle(e.target.value)}
                  placeholder="Название задачи"
                  className="input-base w-full"
                />
              </div>
              {!improveTaskId && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                    Текущее описание
                  </label>
                  <textarea
                    value={improveDescription}
                    onChange={(e) => setImproveDescription(e.target.value)}
                    rows={2}
                    className="input-base w-full resize-none"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleImproveGenerate}
                disabled={improveLoading || (!improveTaskId && !improveTitle.trim())}
                className="btn-primary inline-flex items-center gap-2"
              >
                {improveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Сгенерировать
              </button>
              {improveError && (
                <p className="text-sm text-[var(--asana-red)]">{improveError}</p>
              )}
              {improveResult && (
                <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                    Предложенное описание
                  </p>
                  <p className="text-sm text-[var(--asana-text-primary)] whitespace-pre-wrap">
                    {improveResult}
                  </p>
                  {improveTaskId && (
                    <button
                      type="button"
                      onClick={handleImproveConfirm}
                      disabled={improveConfirming}
                      className="btn-primary mt-4 inline-flex items-center gap-2"
                    >
                      {improveConfirming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Применить к задаче
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "subtasks" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--asana-text-secondary)]">
                Введите название и описание задачи — AI предложит список подзадач.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                  Название задачи
                </label>
                <input
                  type="text"
                  value={subtasksTitle}
                  onChange={(e) => setSubtasksTitle(e.target.value)}
                  placeholder="Название"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                  Описание
                </label>
                <textarea
                  value={subtasksDescription}
                  onChange={(e) => setSubtasksDescription(e.target.value)}
                  rows={2}
                  className="input-base w-full resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSubtasksGenerate}
                disabled={subtasksLoading || !subtasksTitle.trim()}
                className="btn-primary inline-flex items-center gap-2"
              >
                {subtasksLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Предложить подзадачи
              </button>
              {subtasksError && (
                <p className="text-sm text-[var(--asana-red)]">{subtasksError}</p>
              )}
              {subtasksResult && subtasksResult.length > 0 && (
                <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                    Подзадачи
                  </p>
                  <ul className="list-inside list-decimal space-y-1 text-sm text-[var(--asana-text-primary)]">
                    {subtasksResult.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "summary" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--asana-text-secondary)]">
                Краткий анализ проекта: статус, риски и рекомендации.
              </p>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-sm text-[var(--asana-text-placeholder)]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Загрузка…
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-placeholder)]">
                      Проект
                    </label>
                    <select
                      value={summaryProjectId}
                      onChange={(e) => setSummaryProjectId(e.target.value)}
                      className="input-base w-full"
                    >
                      <option value="">Выберите проект</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSummaryGenerate}
                    disabled={summaryLoading || !summaryProjectId}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Сгенерировать резюме
                  </button>
                  {summaryError && (
                    <p className="text-sm text-[var(--asana-red)]">{summaryError}</p>
                  )}
                  {summaryResult && (
                    <div className="space-y-4 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-4">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                          Резюме
                        </p>
                        <p className="text-sm text-[var(--asana-text-primary)]">
                          {summaryResult.summary}
                        </p>
                      </div>
                      {summaryResult.risks.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                            Возможные риски
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-sm text-[var(--asana-text-secondary)]">
                            {summaryResult.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summaryResult.recommendations.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                            Рекомендации
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-sm text-[var(--asana-text-secondary)]">
                            {summaryResult.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
