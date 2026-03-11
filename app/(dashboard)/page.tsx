import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { TodayAndOverdueTasks } from "@/components/dashboard/TodayAndOverdueTasks";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const notificationTasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      deadline: { not: null },
      OR: [
        { deadline: { lt: startOfToday } },
        {
          deadline: { gte: startOfToday, lt: endOfToday }
        }
      ]
    },
    include: {
      project: { select: { id: true, name: true } }
    },
    orderBy: { deadline: "asc" }
  });

  const overdue = notificationTasks.filter(
    (t) => t.deadline && t.deadline < startOfToday
  );
  const dueToday = notificationTasks.filter(
    (t) =>
      t.deadline &&
      t.deadline >= startOfToday &&
      t.deadline < endOfToday
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="page-title text-zinc-50">Дашборд</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Вы вошли как{" "}
              <span className="font-medium text-zinc-400">{user.email}</span>
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn-secondary">
              Выйти
            </button>
          </form>
        </header>

        <div className="space-y-10">
          <TodayAndOverdueTasks overdue={overdue} dueToday={dueToday} />
          <CreateProjectForm />
          <ProjectList />
        </div>
      </div>
    </div>
  );
}
