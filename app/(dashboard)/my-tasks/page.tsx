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

  return (
    <MyTasksView
      projects={projects}
      user={user}
    />
  );
}
