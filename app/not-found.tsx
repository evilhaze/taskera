import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-white">404</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Страница не найдена
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          This page could not be found.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            На главную
          </Link>
          <Link
            href="/app/dashboard"
            className="rounded-lg border border-zinc-600 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-white/10"
          >
            В приложение
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
