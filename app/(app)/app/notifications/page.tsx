import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodayAndOverdueTasks } from "@/components/dashboard/TodayAndOverdueTasks";

export default async function NotificationsPage() {
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

  const notificationTasks = projectIds.length
    ? await prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          deadline: { not: null },
          status: { not: "DONE" },
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
      })
    : [];

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
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Уведомления
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          Просроченные задачи и задачи на сегодня
        </p>
      </header>
      <TodayAndOverdueTasks
        overdue={overdue.map((t) => ({
          id: t.id,
          title: t.title,
          deadline: t.deadline,
          status: t.status,
          project: t.project
        }))}
        dueToday={dueToday.map((t) => ({
          id: t.id,
          title: t.title,
          deadline: t.deadline,
          status: t.status,
          project: t.project
        }))}
      />
      {overdue.length === 0 && dueToday.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--asana-text-secondary)]">Нет уведомлений</p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Здесь появятся просроченные задачи и задачи на сегодня
          </p>
        </div>
      )}
    </div>
  );
}
