import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EditableProjectTitle } from "./EditableProjectTitle";

type Props = {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  ownerEmail: string;
  isOwner: boolean;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  progressPercent: number;
};

export function ProjectSummarySection({
  projectId,
  projectName,
  projectDescription,
  ownerEmail,
  isOwner,
  totalTasks,
  doneTasks,
  overdueTasks,
  progressPercent
}: Props) {
  return (
    <header className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)] transition-colors mb-4"
      >
        <span aria-hidden>←</span>
        Назад к дашборду
      </Link>
      <EditableProjectTitle
        projectId={projectId}
        projectName={projectName}
        isOwner={isOwner}
      />
      {projectDescription && (
        <p className="mt-1.5 text-[var(--asana-text-secondary)]">{projectDescription}</p>
      )}
      <p className="mt-2 text-xs text-[var(--asana-text-placeholder)]">
        Владелец: {ownerEmail}
        {isOwner && " (вы)"}
      </p>

      <div className="mt-6 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <ProgressBar
              value={progressPercent}
              label="Прогресс проекта"
              size="lg"
              showPercent
            />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-[var(--asana-text-secondary)]">
              <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                {totalTasks}
              </span>{" "}
              задач всего
            </span>
            <span className="text-[var(--asana-text-secondary)]">
              <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                {doneTasks}
              </span>{" "}
              выполнено
            </span>
            {overdueTasks > 0 && (
              <span className="font-medium tabular-nums text-[var(--asana-red)]">
                {overdueTasks} просрочено
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
