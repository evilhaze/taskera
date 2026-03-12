"use client";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
      <span className="font-medium">Демо-режим</span>
      <span className="text-amber-700 dark:text-amber-300">
        — Вы используете демо-версию Taskera. Некоторые функции ограничены.
      </span>
    </div>
  );
}
