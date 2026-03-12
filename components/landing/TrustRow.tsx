"use client";

import Image from "next/image";
import { Zap, LayoutGrid, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const TRUST_ITEMS = [
  { icon: Zap, label: "Быстрый старт" },
  { icon: LayoutGrid, label: "Гибкое управление задачами" },
  { icon: Users, label: "Командная работа" },
  { icon: Sparkles, label: "AI-помощник" }
];

export function TrustRow() {
  return (
    <section className="border-b border-neutral-200/60 bg-neutral-50/30 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex justify-center"
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-lg shadow-neutral-200/30">
            <Image
              src="/landing/TaskeraPic.png"
              alt="Taskera — управление задачами на десктопе и в мобильном приложении"
              width={896}
              height={504}
              className="h-auto w-full object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        </motion.div>
        <p className="text-center text-sm font-medium text-neutral-500">
          Для продуктовых команд, агентств и стартапов
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        >
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-sm text-neutral-600"
            >
              <Icon className="h-4 w-4 text-indigo-500" aria-hidden />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
