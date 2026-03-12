import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const FREE_FEATURES = [
  "До 3 досок / проектов",
  "Drag & Drop",
  "Базовая аналитика",
  "Командная работа",
  "Базовые уведомления"
];

const PRO_FEATURES = [
  "Неограниченные доски",
  "Расширенная аналитика",
  "AI Assistant",
  "Кастомизация",
  "Приоритетная поддержка"
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Тарифы
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Выберите план для своей команды
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8">
          <h2 className="text-xl font-semibold text-white">Free</h2>
          <p className="mt-2 text-zinc-400">Для знакомства и небольших команд</p>
          <div className="mt-6">
            <span className="text-4xl font-bold text-white">0 ₽</span>
            <span className="text-zinc-500"> / месяц</span>
          </div>
          <ul className="mt-8 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-10 block w-full rounded-lg border border-zinc-600 bg-white/5 py-3 text-center font-medium text-white transition-colors hover:border-zinc-500 hover:bg-white/10"
          >
            Начать бесплатно
          </Link>
        </div>

        <div className="relative rounded-2xl border border-violet-500/30 bg-[#131118] p-8 shadow-lg shadow-violet-500/5">
          <div className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-[#0a0a0a] px-3 py-1 text-xs font-semibold text-violet-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Рекомендуем
          </div>
          <h2 className="text-xl font-semibold text-white">Plus</h2>
          <p className="mt-2 text-zinc-400">Для команд, которым нужны AI и масштаб</p>
          <div className="mt-6">
            <span className="text-4xl font-bold text-white">—</span>
            <span className="text-zinc-500"> / месяц</span>
          </div>
          <ul className="mt-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-10 block w-full rounded-lg bg-white py-3 text-center font-semibold text-black transition-opacity hover:opacity-90"
          >
            Попробовать Plus
          </Link>
        </div>
      </div>
    </div>
  );
}
