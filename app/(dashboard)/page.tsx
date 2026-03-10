import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-400 mb-6">
          Вы вошли как <span className="text-slate-200">{user.email}</span>
        </p>
        <div className="flex gap-4">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-md bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-200"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
