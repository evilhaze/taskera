import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--asana-bg-app)]">
      <AppSidebar />
      <div className="pl-[240px]">
        <AppTopbar user={user} />
        <main className="min-h-[calc(100vh-48px)] bg-[var(--asana-bg-content)] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
