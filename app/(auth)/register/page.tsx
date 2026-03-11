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

    window.location.href = "/";
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
