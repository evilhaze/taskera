import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembersSection } from "@/components/project/MembersSection";
import { TasksSection } from "@/components/project/TasksSection";
import { AnalyticsSection } from "@/components/project/AnalyticsSection";

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId }
    },
    include: {
      project: {
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: {
              user: { select: { id: true, email: true, name: true } }
            }
          }
        }
      }
    }
  });

  if (!membership) notFound();

  const project = membership.project;
  const isOwner = membership.role === "OWNER";

  const [total, byStatusRows, overdue] = await Promise.all([
    prisma.task.count({ where: { projectId } }),
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true }
    }),
    prisma.task.count({
      where: {
        projectId,
        deadline: { lt: new Date() },
        status: { not: "DONE" }
      }
    })
  ]);

  const byStatus = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0
  };
  for (const row of byStatusRows) {
    byStatus[row.status] = row._count._all;
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <span aria-hidden>←</span>
            Назад к дашборду
          </Link>
          <h1 className="page-title text-zinc-50">{project.name}</h1>
          {project.description && (
            <p className="mt-1.5 text-zinc-500">{project.description}</p>
          )}
          <p className="mt-2 text-xs text-zinc-600">
            Владелец: {project.owner.email}
            {isOwner && " (вы)"}
          </p>
        </header>

        <div className="space-y-10">
          <MembersSection
            projectId={project.id}
            members={project.members}
            ownerId={project.ownerId}
            currentUserId={user.id}
            isOwner={isOwner}
          />

          <AnalyticsSection
            total={total}
            byStatus={byStatus}
            overdue={overdue}
          />

          <TasksSection
            projectId={project.id}
            members={project.members.map((m) => ({
              id: m.user.id,
              email: m.user.email,
              name: m.user.name
            }))}
          />
        </div>
      </div>
    </div>
  );
}
