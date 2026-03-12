"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, UserPlus, LayoutGrid, ListTodo, Users, ArrowRight } from "lucide-react";

const DOC_ITEMS = [
  { icon: UserPlus, title: "Регистрация", description: "Создайте аккаунт по email или войдите через Google/GitHub." },
  { icon: LayoutGrid, title: "Создание проекта", description: "В дашборде создайте проект и добавьте доску." },
  { icon: ListTodo, title: "Доска и задачи", description: "Добавьте колонки и задачи, перетаскивайте между статусами." },
  { icon: Users, title: "Работа с командой", description: "Приглашайте участников и назначайте задачи." }
];

export function DocsPreviewSection() {
  return (
    <section className="border-b border-neutral-200/60 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-8 sm:p-10"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Документация и быстрый старт
              </h2>
              <p className="mt-3 max-w-xl text-neutral-600">
                Пошаговые инструкции: регистрация, создание проекта и доски, добавление задач и приглашение команды.
              </p>
              <ul className="mt-6 space-y-3">
                {DOC_ITEMS.map(({ icon: Icon, title }) => (
                  <li key={title} className="flex items-center gap-3 text-sm text-neutral-700">
                    <Icon className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                    {title}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/docs"
              className="shrink-0 rounded-lg bg-neutral-900 px-6 py-3 text-center font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Открыть документацию
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
