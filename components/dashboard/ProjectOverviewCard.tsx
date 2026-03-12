import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";

type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  membersCount: number;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  progressPercent: number;
  myRole: string;
};

type Props = {
  project: ProjectSummary;
};

export function ProjectOverviewCard({ project }: Props) {
  return (
    <Link
      href={`/app/projects/${project.id}`}
      className="block rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5 transition-all hover:border-[var(--asana-border)] hover:shadow-md hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-[var(--asana-text-primary)] truncate">
          {project.name}
        </span>
        {project.myRole === "OWNER" && (
          <span className="shrink-0 rounded bg-[var(--asana-bg-card-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--asana-text-secondary)]">
            Владелец
          </span>
        )}
      </div>
      {project.description != null && project.description !== "" && (
        <p className="mt-1.5 line-clamp-2 text-sm text-[var(--asana-text-secondary)]">
          {project.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--asana-text-secondary)]">
        <span>{project.membersCount} участников</span>
        <span>{project.totalTasks} задач</span>
        {project.overdueTasks > 0 && (
          <span className="font-medium text-[var(--asana-red)]">
            {project.overdueTasks} просрочено
          </span>
        )}
      </div>
      <div className="mt-4">
        <ProgressBar
          value={project.progressPercent}
          size="sm"
          showPercent
          className="[--progress-track:var(--asana-bg-input)]"
        />
      </div>
    </Link>
  );
}
