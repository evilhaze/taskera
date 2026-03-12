"use client";

import Link from "next/link";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-block rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-2.5 py-1 text-sm font-bold text-white shadow-sm"
            >
              Taskera
            </Link>
            <p className="mt-3 max-w-xs text-sm text-neutral-600">
              Современное управление задачами и проектами для команд.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link href="/pricing" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Тарифы
            </Link>
            <Link href="/docs" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Документация
            </Link>
            <Link href="/login" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Войти
            </Link>
            <Link href="/register" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Начать
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-neutral-200 pt-8">
          <p className="text-sm text-neutral-500">© {year} Taskera. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
