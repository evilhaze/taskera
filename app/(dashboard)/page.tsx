import { redirect } from "next/navigation";
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
    <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="page-title text-[var(--asana-text-primary)]">Дашборд</h1>
          <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
            Вы вошли как{" "}
            <span className="font-medium text-[var(--asana-text-primary)]">{user.email}</span>
          </p>
        </header>

        <div className="space-y-10">
          <TodayAndOverdueTasks overdue={overdue} dueToday={dueToday} />
          <CreateProjectForm />
          <ProjectList />
        </div>
    </div>
  );
}
