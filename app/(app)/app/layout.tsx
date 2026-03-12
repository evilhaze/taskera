import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/sidebar-data";
import { isDemoUser } from "@/lib/demo";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { UpsellModalTrigger } from "@/components/demo/UpsellModalTrigger";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboardData = await getDashboardData(user.id);
  const isDemo = isDemoUser(user);

  return (
    <div className="min-h-screen bg-[var(--asana-bg-app)]">
      <UpsellModalTrigger />
      <AppSidebar
        initialProjects={dashboardData.projects}
        initialStats={dashboardData.sidebarStats}
      />
      <div className="pl-[240px]">
        {isDemo && <DemoBanner />}
        <AppTopbar
          user={user}
          aiEnabled={dashboardData.aiEnabled && !isDemo}
          isDemo={isDemo}
        />
        <main className="min-h-[calc(100vh-48px)] bg-[var(--asana-bg-content)] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
