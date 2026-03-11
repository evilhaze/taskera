import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddMemberForm } from "@/components/project/AddMemberForm";

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
          owner: { select: { id, email, name } },
          members: {
            include: {
              user: { select: { id, email, name } }
            }
          }
        }
      }
    }
  });

  if (!membership) notFound();

  const project = membership.project;
  const isOwner = membership.role === "OWNER";

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-200 mb-2 inline-block"
          >
            ← Назад к дашборду
          </Link>
          <h1 className="text-2xl font-semibold text-slate-50">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-slate-400">{project.description}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Владелец: {project.owner.email}
            {isOwner && " (вы)"}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-slate-200 mb-3">Участники</h2>
          <ul className="rounded-lg border border-slate-700 bg-slate-900/50 divide-y divide-slate-700">
            {project.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-slate-200">{m.user.email}</span>
                  {m.user.name && (
                    <span className="ml-2 text-slate-500 text-sm">{m.user.name}</span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {m.userId === project.ownerId ? "Владелец" : "Участник"}
                </span>
              </li>
            ))}
          </ul>

          {isOwner && (
            <div className="mt-4">
              <AddMemberForm projectId={project.id} />
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-400 text-center">
          <p>Канбан-доска и задачи будут на этой странице в следующем шаге.</p>
          <Link href={`/projects/${project.id}`} className="text-sky-400 hover:underline mt-2 inline-block">
            Обновить
          </Link>
        </section>
      </div>
    </div>
  );
}
