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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--app-bg)]">
      <div className="w-full max-w-[400px]">
        <div className="card p-8">
          <h1 className="page-title text-center mb-1">Регистрация</h1>
          <p className="text-center text-sm text-zinc-500 mb-8">
            Создайте аккаунт
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-zinc-400"
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
                className="block text-sm font-medium text-zinc-400"
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
                className="block text-sm font-medium text-zinc-400"
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
              <div className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2.5">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Создание…" : "Создать аккаунт"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Уже есть аккаунт?{" "}
            <a
              href="/login"
              className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
