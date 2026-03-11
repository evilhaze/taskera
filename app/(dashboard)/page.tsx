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
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">Dashboard</h1>
            <p className="text-slate-400">
              Вы вошли как <span className="text-slate-200">{user.email}</span>
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
            >
              Выйти
            </button>
          </form>
        </header>

        <div className="space-y-8">
          <TodayAndOverdueTasks
            overdue={overdue}
            dueToday={dueToday}
          />
          <CreateProjectForm />
          <ProjectList />
        </div>
      </div>
    </div>
  );
}
