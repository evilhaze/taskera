"use client";

import { motion } from "framer-motion";
import { FolderPlus, LayoutGrid, ListTodo, Users } from "lucide-react";

const STEPS = [
  { step: 1, icon: FolderPlus, title: "Создайте рабочее пространство", description: "Настройте проект и доски" },
  { step: 2, icon: LayoutGrid, title: "Создайте доску", description: "Добавьте колонки и настройте процесс" },
  { step: 3, icon: ListTodo, title: "Добавьте задачи", description: "Создавайте задачи и перетаскивайте между статусами" },
  { step: 4, icon: Users, title: "Управляйте командой", description: "Приглашайте участников и назначайте задачи" }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-neutral-200/60 bg-neutral-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Как это работает
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Четыре шага к продуктивному рабочему процессу
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map(({ step, icon: Icon, title, description }) => (
            <motion.div
              key={step}
              variants={item}
              whileHover={{ y: -2 }}
              className="relative rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {step}
              </span>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
