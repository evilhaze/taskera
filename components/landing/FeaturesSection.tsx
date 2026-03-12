"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Users,
  BarChart3,
  History,
  Sparkles,
  CalendarClock
} from "lucide-react";

const FEATURES = [
  { icon: LayoutGrid, title: "Kanban-доски", description: "Визуальное управление задачами и статусами" },
  { icon: Users, title: "Командная работа", description: "Участники, роли и общие доски" },
  { icon: BarChart3, title: "Аналитика задач", description: "Прогресс, просроченные и загрузка" },
  { icon: History, title: "История активности", description: "Полная история изменений" },
  { icon: Sparkles, title: "AI-помощник", description: "Создание задач и подзадач из текста" },
  { icon: CalendarClock, title: "Умные дедлайны", description: "Вид «Сегодня» и напоминания" }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-neutral-200/60 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Преимущества
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Всё необходимое для управления задачами и командой в одном месте
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm shadow-neutral-200/30 transition-shadow hover:shadow-lg hover:shadow-neutral-200/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
