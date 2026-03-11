"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { AVATAR_EMOJI_OPTIONS } from "@/lib/constants/avatar";

type User = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthDate: string | null;
  position: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  createdAt?: string;
};

export function ProfileSettingsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name ?? "");
          setFirstName(data.firstName ?? "");
          setLastName(data.lastName ?? "");
          setNickname(data.nickname ?? "");
          setBirthDate(data.birthDate ?? "");
          setPosition(data.position ?? "");
          setBio(data.bio ?? "");
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
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          nickname: nickname.trim() || null,
          birthDate: birthDate.trim() ? birthDate : null,
          position: position.trim() || null,
          bio: bio.trim() || null,
          avatarEmoji: avatarEmoji || null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось сохранить");
        return;
      }
      setUser(data);
      setName(data.name ?? "");
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setNickname(data.nickname ?? "");
      setBirthDate(data.birthDate ?? "");
      setPosition(data.position ?? "");
      setBio(data.bio ?? "");
      setAvatarEmoji(data.avatarEmoji ?? null);
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
          <UserAvatar
            user={{
              ...user,
              name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name
            }}
            size="lg"
          />
          <div>
            <p className="font-medium text-[var(--asana-text-primary)]">{user.email}</p>
            {(user.firstName || user.lastName || user.name) && (
              <p className="text-sm text-[var(--asana-text-secondary)]">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.name}
                {user.nickname && ` (@${user.nickname})`}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--asana-text-primary)]">Основное</h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                Имя (отображаемое)
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">Имя</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Имя"
                  maxLength={100}
                  className="input-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">Фамилия</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Фамилия"
                  maxLength={100}
                  className="input-base"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">Никнейм</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="nickname"
                maxLength={100}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">Должность</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Например: Разработчик"
                maxLength={200}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">Дата рождения</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Кратко о себе"
                maxLength={2000}
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-[var(--asana-border-subtle)] pt-6">
            <h2 className="text-sm font-semibold text-[var(--asana-text-primary)]">Аватар (эмодзи)</h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                Выберите эмодзи-аватар
              </label>
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
