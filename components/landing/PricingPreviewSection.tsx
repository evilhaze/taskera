"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const FREE_FEATURES = [
  "До 3 досок / проектов",
  "Перетаскивание",
  "Базовая аналитика",
  "Командная работа",
  "Базовые уведомления"
];

const PRO_FEATURES = [
  "Безлимит досок",
  "Расширенная аналитика",
  "AI-помощник",
  "Настройка под себя",
  "Приоритетная поддержка"
];

export function PricingPreviewSection() {
  return (
    <section id="pricing" className="border-b border-neutral-200/60 bg-neutral-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Тарифы
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Начните бесплатно и перейдите на платный план, когда понадобится больше
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-10"
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-neutral-900">Бесплатно</h3>
            <p className="mt-2 text-neutral-600">Для небольших команд и старта</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-neutral-900">0 ₽</span>
              <span className="text-neutral-500"> / месяц</span>
            </div>
            <ul className="mt-8 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-neutral-700">
                  <Check className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-10 block w-full rounded-lg border border-neutral-300 bg-white py-3 text-center font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Начать
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="relative rounded-2xl border-2 border-indigo-200 bg-white p-8 shadow-lg shadow-indigo-100/50"
          >
            <div className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Рекомендуем
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Plus</h3>
            <p className="mt-2 text-neutral-600">Для команд с AI и масштабированием</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-neutral-900">—</span>
              <span className="text-neutral-500"> / месяц</span>
            </div>
            <ul className="mt-8 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-neutral-700">
                  <Check className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-10 block w-full rounded-lg bg-neutral-900 py-3 text-center font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Попробовать Plus
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
