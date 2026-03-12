"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, BarChart3, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PreviewTab = "task" | "kanban" | "dashboard";

const TABS: { id: PreviewTab; label: string; icon: LucideIcon }[] = [
  { id: "kanban", label: "Kanban board", icon: LayoutGrid },
  { id: "task", label: "Task modal", icon: FileText },
  { id: "dashboard", label: "Dashboard analytics", icon: BarChart3 }
];

const PREVIEW_IMAGES: Record<PreviewTab, string> = {
  kanban: "/landing/kanban.png",
  task: "/landing/task-modal2.png",
  dashboard: "/landing/dashboard.png"
};

export function ProductPreviewSection() {
  const [active, setActive] = useState<PreviewTab>("kanban");
  const [imgError, setImgError] = useState(false);

  const imgSrc = PREVIEW_IMAGES[active];

  const handleTab = (tab: PreviewTab) => {
    setImgError(false);
    setActive(tab);
  };

  return (
    <section id="product-preview" className="border-b border-neutral-200/60 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Обзор продукта
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Kanban, детали задач и аналитика в одном интерфейсе
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center gap-2 border-b border-neutral-200"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active === id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-900/5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full min-h-[280px] bg-neutral-50 flex items-center justify-center"
            >
              {!imgError ? (
                <img
                  src={imgSrc}
                  alt={TABS.find((t) => t.id === active)?.label ?? "Product preview"}
                  className="w-full h-auto object-contain object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                <p className="text-neutral-500 text-sm py-12">
                  Добавьте скриншоты в <code className="bg-neutral-200 px-1 rounded">public/landing/</code>: kanban.png, task-modal2.png, dashboard.png
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
