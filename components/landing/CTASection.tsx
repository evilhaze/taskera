"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200/60 bg-gradient-to-b from-indigo-50/80 via-white to-white py-24 sm:py-28">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
      >
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Управляйте задачами умнее
        </h2>
        <p className="mt-6 text-lg text-neutral-600">
          Начните бесплатно и настройте рабочий процесс команды в Taskera уже сегодня.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Начать
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            Войти
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
