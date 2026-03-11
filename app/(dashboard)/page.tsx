import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
          <CreateProjectForm />
          <ProjectList />
        </div>
      </div>
    </div>
  );
}
