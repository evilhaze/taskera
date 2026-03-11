import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembersSection } from "@/components/project/MembersSection";
import { TasksSection } from "@/components/project/TasksSection";
import { AnalyticsSection } from "@/components/project/AnalyticsSection";
import { ManageLabelsSection } from "@/components/labels/ManageLabelsSection";
import { ProjectSummarySection } from "@/components/project/ProjectSummarySection";

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

  const doneTasks = byStatus.DONE;
  const progressPercent = total > 0 ? Math.round((doneTasks / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectSummarySection
        projectName={project.name}
        projectDescription={project.description}
        ownerEmail={project.owner.email}
        isOwner={isOwner}
        totalTasks={total}
        doneTasks={doneTasks}
        overdueTasks={overdue}
        progressPercent={progressPercent}
      />

      <div className="space-y-10">
        <MembersSection
          projectId={project.id}
          members={project.members}
          ownerId={project.ownerId}
          currentUserId={user.id}
          isOwner={isOwner}
        />

        <ManageLabelsSection projectId={project.id} />

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
  );
}
