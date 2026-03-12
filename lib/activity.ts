"use strict";
import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий"
};

export type ActivityMeta = {
  taskTitle?: string;
  oldValue?: string;
  newValue?: string;
  assigneeEmail?: string;
  memberEmail?: string;
  labelName?: string;
  subtaskTitle?: string;
  [key: string]: unknown;
};

/**
 * Создаёт запись активности. Вызывать после успешного действия.
 * Если модель Activity недоступна (клиент не регенерирован), запись пропускается без ошибки.
 */
export async function createActivity(params: {
  userId: string;
  projectId: string;
  type: ActivityType;
  message: string;
  taskId?: string | null;
  metadata?: ActivityMeta | null;
}) {
  const { userId, projectId, type, message, taskId, metadata } = params;
  try {
    if (!prisma.activity) return;
    await prisma.activity.create({
      data: {
        userId,
        projectId,
        type,
        message,
        taskId: taskId ?? null,
        metadata: metadata ? (metadata as object) : null
      }
    });
  } catch {
    // Не ломаем основной поток при ошибке записи активности
  }
}

/**
 * Генерирует human-readable сообщение для лога.
 * message уже приходит готовым в большинстве случаев; здесь — вспомогательные шаблоны.
 */
export function formatActivityMessage(
  type: ActivityType,
  userName: string,
  meta?: ActivityMeta | null
): string {
  const name = userName || "Кто-то";
  const task = meta?.taskTitle ? ` «${meta.taskTitle}»` : "";

  switch (type) {
    case "TASK_CREATED":
      return `${name} создал задачу${task}`;
    case "TASK_UPDATED":
      return meta?.oldValue !== undefined && meta?.newValue !== undefined
        ? `${name} изменил задачу${task}: ${meta.oldValue} → ${meta.newValue}`
        : `${name} обновил задачу${task}`;
    case "TASK_STATUS_CHANGED":
      return meta?.newValue
        ? `${name} перевёл задачу${task} в статус «${STATUS_LABELS[meta.newValue] ?? meta.newValue}»`
        : `${name} изменил статус задачи${task}`;
    case "TASK_ASSIGNEE_CHANGED":
      return meta?.assigneeEmail
        ? `${name} назначил задачу${task} на ${meta.assigneeEmail}`
        : meta?.oldValue
          ? `${name} снял исполнителя с задачи${task}`
          : `${name} изменил исполнителя задачи${task}`;
    case "TASK_PRIORITY_CHANGED":
      return meta?.newValue
        ? `${name} изменил приоритет задачи${task} на «${PRIORITY_LABELS[meta.newValue] ?? meta.newValue}»`
        : `${name} изменил приоритет задачи${task}`;
    case "TASK_DEADLINE_CHANGED":
      return meta?.newValue
        ? `${name} изменил дедлайн задачи${task} на ${meta.newValue}`
        : `${name} изменил дедлайн задачи${task}`;
    case "COMMENT_ADDED":
      return `${name} добавил комментарий к задаче${task}`;
    case "LABEL_ADDED":
      return meta?.labelName
        ? `${name} добавил метку «${meta.labelName}» к задаче${task}`
        : `${name} добавил метку к задаче${task}`;
    case "LABEL_REMOVED":
      return meta?.labelName
        ? `${name} удалил метку «${meta.labelName}» у задачи${task}`
        : `${name} удалил метку у задачи${task}`;
    case "PROJECT_CREATED":
      return `${name} создал проект`;
    case "MEMBER_ADDED":
      return meta?.memberEmail
        ? `${name} добавил участника ${meta.memberEmail} в проект`
        : `${name} добавил участника в проект`;
    case "SUBTASK_CREATED":
      return meta?.subtaskTitle
        ? `${name} добавил подзадачу «${meta.subtaskTitle}»`
        : `${name} добавил подзадачу`;
    case "SUBTASK_COMPLETED":
      return meta?.subtaskTitle
        ? `${name} выполнил подзадачу «${meta.subtaskTitle}»`
        : `${name} выполнил подзадачу`;
    case "SUBTASK_DELETED":
      return meta?.subtaskTitle
        ? `${name} удалил подзадачу «${meta.subtaskTitle}»`
        : `${name} удалил подзадачу`;
    default:
      return name;
  }
}
