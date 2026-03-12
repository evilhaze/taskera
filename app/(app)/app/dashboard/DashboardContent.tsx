import { getDashboardAnalytics } from "@/lib/dashboard";
import {
  ListTodo,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Percent,
  FolderKanban
} from "lucide-react";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { ScrollToCreateProject } from "@/components/dashboard/ScrollToCreateProject";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { ProjectOverviewCard } from "@/components/dashboard/ProjectOverviewCard";
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown";
import { OverdueInsight } from "@/components/dashboard/OverdueInsight";
import { WorkloadList } from "@/components/dashboard/WorkloadList";
import { RecentActivityPreview } from "@/components/dashboard/RecentActivityPreview";

type Props = { userId: string };

export async function DashboardContent({ userId }: Props) {
  const analytics = await getDashboardAnalytics(userId);
  const {
    summary,
    byStatus,
    workloadByUser,
    recentActivityPreview,
    overdueTasksPreview,
    projectSummaries
  } = analytics;

  return (
    <>
      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <AnalyticsCard
            title="Всего задач"
            value={summary.totalTasks}
            icon={ListTodo}
          />
          <AnalyticsCard
            title="Выполнено"
            value={summary.completedTasks}
            icon={CheckCircle2}
            variant="success"
          />
          <AnalyticsCard
            title="В работе"
            value={summary.inProgressTasks}
            icon={Loader2}
          />
          <AnalyticsCard
            title="Просрочено"
            value={summary.overdueTasks}
            icon={AlertTriangle}
            variant={summary.overdueTasks > 0 ? "danger" : "default"}
          />
          <AnalyticsCard
            title="Прогресс"
            value={`${summary.completionRate}%`}
            subtitle="завершено"
            icon={Percent}
            variant="muted"
          />
          <AnalyticsCard
            title="Проектов"
            value={summary.totalProjects}
            icon={FolderKanban}
          />
        </div>
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5 lg:col-span-2">
          <StatusBreakdown byStatus={byStatus} total={summary.totalTasks} />
        </div>
        <div className="space-y-6">
          <AnalyticsCard
            title="Завершено за 7 дней"
            value={summary.tasksCompletedThisWeek}
            subtitle="задач за неделю"
            variant="success"
          />
          <OverdueInsight
            count={summary.overdueTasks}
            tasks={overdueTasksPreview}
          />
        </div>
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <WorkloadList items={workloadByUser} />
        <RecentActivityPreview activities={recentActivityPreview} />
      </section>

      <ScrollToCreateProject />
      <div className="space-y-10" id="create-project">
        <CreateProjectForm />
        <section>
          <h2 className="section-title mb-4">Мои проекты</h2>
          {projectSummaries.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-14 text-center">
              <p className="text-[var(--asana-text-secondary)]">
                Проектов пока нет.
              </p>
              <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
                Создайте первый проект с помощью формы выше.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {projectSummaries.map((p) => (
                <li key={p.id}>
                  <ProjectOverviewCard project={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
