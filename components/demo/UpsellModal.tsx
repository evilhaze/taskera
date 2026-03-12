"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

const TITLE = "Откройте полную версию Taskera";
const BODY =
  "В демо-режиме доступны только базовые возможности. Перейдите на Taskera Plus, чтобы создавать больше проектов и задач, использовать AI Assistant и управлять командой без ограничений.";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UpsellModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !mounted) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, mounted]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-[var(--asana-border)] bg-[var(--asana-bg-card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-500">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--asana-text-placeholder)] hover:bg-white/10 hover:text-[var(--asana-text-primary)]"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2
            id="upsell-title"
            className="text-xl font-semibold text-[var(--asana-text-primary)]"
          >
            {TITLE}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--asana-text-secondary)]">
            {BODY}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Купить подписку Plus
            </Link>
            <Link
              href="/pricing"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--asana-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--asana-text-primary)] transition-colors hover:bg-white/5"
            >
              Посмотреть тарифы
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-[var(--asana-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const EVENT_NAME = "open-demo-upsell";

export function openUpsellModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function useUpsellListener(openModal: () => void) {
  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [openModal]);
}
