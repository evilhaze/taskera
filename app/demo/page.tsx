import { redirect } from "next/navigation";
import Link from "next/link";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DemoEntryPage() {
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--asana-bg-app)] px-4 py-12">
        <div className="card w-full max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--asana-text-primary)]">
            Демо временно недоступно
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--asana-text-secondary)]">
            Для запуска демо нужна база данных. Добавьте переменную{" "}
            <code className="rounded bg-[var(--asana-bg-input)] px-1.5 py-0.5 text-xs">
              DATABASE_URL
            </code>{" "}
            в файл <code className="rounded bg-[var(--asana-bg-input)] px-1.5 py-0.5 text-xs">.env.local</code> и перезапустите сервер.
          </p>
          <Link
            href="/login"
            className="btn-primary mt-6 inline-block w-full sm:w-auto"
          >
            На страницу входа
          </Link>
        </div>
      </div>
    );
  }

  const { getOrCreateDemoUser } = await import("@/lib/demo-seed");
  const user = await getOrCreateDemoUser();
  await setAuthCookie(user.id);
  redirect("/app/dashboard");
}
