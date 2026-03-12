"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200/60 bg-gradient-to-b from-neutral-50 via-white to-white px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.h1
              variants={item}
              className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
            >
              Современная платформа для управления задачами
            </motion.h1>
            <motion.p
              variants={item}
              className="max-w-xl text-lg text-neutral-600 leading-relaxed"
            >
              Организуйте проекты, управляйте задачами и работайте с командой в одном месте.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-neutral-900/25 transition-all hover:shadow-xl hover:shadow-neutral-900/30"
              >
                Начать
              </Link>
              <Link
                href="/api/demo/start"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              >
                Смотреть демо
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xl shadow-neutral-200/50 ring-1 ring-neutral-900/5"
            >
              <div className="flex gap-2 border-b border-neutral-100 pb-3">
                {["К выполнению", "В работе", "На проверке", "Готово"].map((col) => (
                  <div
                    key={col}
                    className="flex-1 rounded-lg bg-neutral-50 px-3 py-2 text-center text-xs font-medium text-neutral-500"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                {[
                  [
                    { title: "Редизайн главной страницы", meta: "15.03" },
                    { title: "Интеграция с календарём", meta: "Анна" },
                    { title: "Обновить документацию API", meta: "20.03" }
                  ],
                  [
                    { title: "Ревью компонентов UI", meta: "Максим" },
                    { title: "Тесты для модуля авторизации", meta: "18.03" }
                  ],
                  [
                    { title: "Проверка мобильной версии", meta: "Ольга" },
                    { title: "Код-ревью PR #142", meta: "Дмитрий" }
                  ],
                  [
                    { title: "Релиз v2.1", meta: "✓" },
                    { title: "Миграция на новую БД", meta: "✓" }
                  ]
                ].map((cards, colIdx) => (
                  <div key={colIdx} className="flex-1 space-y-2">
                    {cards.map((card, cardIdx) => (
                      <div
                        key={cardIdx}
                        className="rounded-xl border border-neutral-100 bg-white p-2.5 shadow-sm"
                      >
                        <p className="text-[13px] font-medium text-neutral-800 leading-tight">{card.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-medium text-indigo-600">
                            {card.meta === "✓" ? "✓" : /^\d/.test(card.meta) ? "•" : card.meta.charAt(0)}
                          </div>
                          <span className="text-[11px] text-neutral-500">{card.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                <span>AI-помощник</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-medium">Plus</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
