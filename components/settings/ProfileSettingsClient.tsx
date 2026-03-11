"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { AVATAR_EMOJI_OPTIONS } from "@/lib/constants/avatar";

type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  avatarEmoji: string | null;
};

export function ProfileSettingsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name ?? "");
          setAvatarEmoji(data.avatarEmoji ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          avatarEmoji: avatarEmoji || null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось сохранить");
        return;
      }
      setUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--asana-bg-input)]" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-[var(--asana-bg-input)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-[var(--asana-text-secondary)]">Не удалось загрузить профиль.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)] transition-colors mb-6"
      >
        <span aria-hidden>←</span>
        Назад
      </Link>
      <h1 className="page-title text-[var(--asana-text-primary)] mb-2">Настройки профиля</h1>
      <p className="text-sm text-[var(--asana-text-secondary)] mb-8">
        Имя и аватар отображаются в интерфейсе и в карточках задач.
      </p>

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <p className="font-medium text-[var(--asana-text-primary)]">{user.email}</p>
            {user.name && (
              <p className="text-sm text-[var(--asana-text-secondary)]">{user.name}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
              maxLength={200}
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
              Аватар
            </label>
            <p className="mb-2 text-xs text-[var(--asana-text-placeholder)]">
              Выберите эмодзи-аватар
            </p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji((current) => (current === emoji ? null : emoji))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xl transition-colors ${
                    avatarEmoji === emoji
                      ? "border-[var(--asana-blue)] bg-[var(--asana-blue)]/20"
                      : "border-[var(--asana-border)] bg-[var(--asana-bg-input)] hover:border-[var(--asana-text-placeholder)]"
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {avatarEmoji && (
              <p className="mt-1.5 text-xs text-[var(--asana-text-secondary)]">
                Выбрано: <span className="text-base">{avatarEmoji}</span> — нажмите ещё раз, чтобы сбросить.
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-[var(--asana-red)]">{error}</p>
          )}
          {success && (
            <p className="text-sm text-[var(--asana-green)]">Изменения сохранены.</p>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            <Link href="/" className="btn-secondary">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
