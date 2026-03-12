import Link from "next/link";
import { FileText, UserPlus, LayoutGrid, ListTodo, Users, ArrowRight } from "lucide-react";

const DOC_ITEMS = [
  { icon: UserPlus, title: "Регистрация", description: "Создайте аккаунт по email и паролю на странице регистрации." },
  { icon: LayoutGrid, title: "Создание проекта", description: "В дашборде нажмите «Создать» и выберите «Создать проект». Заполните название и описание." },
  { icon: ListTodo, title: "Создание доски", description: "Откройте проект — внутри него доступна Kanban-доска с колонками по умолчанию." },
  { icon: ListTodo, title: "Добавление задач", description: "В колонке нажмите «Добавить задачу» или создайте задачу через форму. Перетаскивайте карточки между колонками." },
  { icon: Users, title: "Работа с командой", description: "В разделе проекта пригласите участников по email. Назначайте исполнителей на задачи и следите за активностью." }
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Документация
      </h1>
      <p className="mt-4 text-neutral-600">
        Быстрый старт и основные сценарии работы с Taskera
      </p>

      <ul className="mt-12 space-y-6">
        {DOC_ITEMS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-16 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center">
        <p className="text-neutral-700">Готовы начать?</p>
        <Link
          href="/register"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Зарегистрироваться
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
