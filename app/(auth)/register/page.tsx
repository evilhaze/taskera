"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name")
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Registration failed");
      return;
    }

    window.location.href = "/app/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--asana-bg-app)] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="card p-8">
          <h1 className="page-title mb-1 text-center">Регистрация</h1>
          <p className="mb-8 text-center text-sm text-[var(--asana-text-secondary)]">
            Создайте аккаунт
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[var(--asana-text-secondary)]"
                htmlFor="name"
              >
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input-base"
                placeholder="Иван"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[var(--asana-text-secondary)]"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-base"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[var(--asana-text-secondary)]"
                htmlFor="password"
              >
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md border border-[var(--asana-red)]/50 bg-[var(--asana-red)]/10 px-3 py-2.5">
                <p className="text-sm text-[var(--asana-red)]">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Создание…" : "Создать аккаунт"}
            </button>

            <div className="relative my-6">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--asana-bg-card)] px-2 text-xs text-[var(--asana-text-placeholder)]">
                или
              </span>
              <div className="h-px bg-[var(--asana-border-subtle)]" />
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-input)] py-2.5 text-sm font-medium text-[var(--asana-text-primary)] transition-colors hover:bg-white/5"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Продолжить с Google
              </a>
              <a
                href="/api/auth/github"
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-input)] py-2.5 text-sm font-medium text-[var(--asana-text-primary)] transition-colors hover:bg-white/5"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                Продолжить с GitHub
              </a>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--asana-text-secondary)]">
            Уже есть аккаунт?{" "}
            <a
              href="/login"
              className="font-medium text-[var(--asana-blue)] hover:text-[var(--asana-blue-dark)] transition-colors"
            >
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
