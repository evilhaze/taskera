import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
        <CreateProjectForm />
        <ProjectList />
      </div>
    </div>
  );
}
