import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyTasksView } from "@/components/dashboard/MyTasksView";

export default async function MyTasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: { select: { id: true, name: true } }
    }
  });
  const projects = memberships.map((m) => m.project);
  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <MyTasksView
      projects={projects}
      userInitials={initials}
    />
  );
}
