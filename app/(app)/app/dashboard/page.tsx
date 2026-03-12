import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Дашборд
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          Обзор задач и проектов ·{" "}
          <span className="font-medium text-[var(--asana-text-primary)]">
            {user.email}
          </span>
        </p>
      </header>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[100px] rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]"
                />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-64 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] lg:col-span-2" />
              <div className="h-64 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
            </div>
          </div>
        }
      >
        <DashboardContent userId={user.id} />
      </Suspense>
    </div>
  );
}
