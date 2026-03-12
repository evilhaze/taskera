import { getAIClient, isAIAvailable } from "@/lib/ai/client";
import {
  buildProjectContext,
  type ProjectMemberForAI
} from "@/lib/ai/context";
import type {
  CreateTaskDraft,
  ImproveDescriptionResult,
  ProjectSummaryResult,
  SuggestSubtasksResult
} from "@/lib/ai/types";

export async function aiCreateTask(
  projectId: string,
  userPrompt: string
): Promise<CreateTaskDraft | null> {
  if (!isAIAvailable()) return null;
  const openai = getAIClient();
  if (!openai) return null;

  const ctx = await buildProjectContext(projectId);
  const membersList = ctx.members
    .map(
      (m) =>
        `- ${m.name ?? m.email} (email: ${m.email}, id: ${m.id})`
    )
    .join("\n");

  const systemPrompt = `Ты — AI-ассистент в системе управления задачами. Пользователь пишет запрос на естественном языке (русский или английский). Ты возвращаешь ТОЛЬКО валидный JSON без markdown и без пояснений.

Формат ответа (все поля обязательны):
{
  "title": "string",
  "description": "string или null",
  "assigneeNameOrEmail": "string или null — имя или email участника из списка ниже",
  "deadline": "YYYY-MM-DD или null",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "status": "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
}

Участники проекта "${ctx.projectName}":
${membersList}

Если пользователь не указал исполнителя, assigneeNameOrEmail = null. Если не указал дедлайн, deadline = null. По умолчанию priority = MEDIUM, status = TODO.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3
  });

  const content = res.choices[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as CreateTaskDraft;
    if (
      typeof parsed.title === "string" &&
      ["LOW", "MEDIUM", "HIGH"].includes(parsed.priority) &&
      ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(parsed.status)
    ) {
      return {
        title: String(parsed.title).trim() || "Без названия",
        description:
          parsed.description != null && String(parsed.description).trim()
            ? String(parsed.description).trim()
            : null,
        assigneeNameOrEmail:
          parsed.assigneeNameOrEmail != null &&
          String(parsed.assigneeNameOrEmail).trim()
            ? String(parsed.assigneeNameOrEmail).trim()
            : null,
        deadline:
          parsed.deadline != null && String(parsed.deadline).trim()
            ? String(parsed.deadline).trim()
            : null,
        priority: parsed.priority,
        status: parsed.status
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function aiImproveDescription(
  title: string,
  currentDescription: string | null
): Promise<ImproveDescriptionResult | null> {
  if (!isAIAvailable()) return null;
  const openai = getAIClient();
  if (!openai) return null;

  const systemPrompt = `Ты — AI-ассистент. Пользователь дал название задачи и текущее описание (может быть пустым). Сгенерируй краткое, чёткое описание задачи (2–5 предложений) на русском. Верни ТОЛЬКО JSON в формате: {"description": "текст описания"}.`;

  const userContent = `Название задачи: ${title}\nТекущее описание: ${currentDescription ?? "(пусто)"}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5
  });

  const content = res.choices[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as ImproveDescriptionResult;
    if (typeof parsed.description === "string") {
      return { description: String(parsed.description).trim() };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function aiSuggestSubtasks(
  title: string,
  description: string | null
): Promise<SuggestSubtasksResult | null> {
  if (!isAIAvailable()) return null;
  const openai = getAIClient();
  if (!openai) return null;

  const systemPrompt = `Ты — AI-ассистент. По названию и описанию задачи предложи 3–7 подзадач (каждая — одно короткое действие). Верни ТОЛЬКО JSON: {"subtasks": ["подзадача 1", "подзадача 2", ...]}. Язык подзадач — русский.`;

  const userContent = `Задача: ${title}\nОписание: ${description ?? "(нет)"}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5
  });

  const content = res.choices[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as SuggestSubtasksResult;
    if (Array.isArray(parsed.subtasks)) {
      return {
        subtasks: parsed.subtasks
          .filter((s): s is string => typeof s === "string")
          .map((s) => String(s).trim())
          .filter(Boolean)
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function aiProjectSummary(
  projectId: string
): Promise<ProjectSummaryResult | null> {
  if (!isAIAvailable()) return null;
  const openai = getAIClient();
  if (!openai) return null;

  const ctx = await buildProjectContext(projectId);

  const systemPrompt = `Ты — AI-ассистент по управлению проектами. По данным проекта верни ТОЛЬКО JSON:
{
  "summary": "краткое текстовое резюме проекта (2–4 предложения на русском)",
  "risks": ["риск 1", "риск 2", ...],
  "recommendations": ["рекомендация 1", "рекомендация 2", ...]
}
risks и recommendations — массивы строк (0–5 пунктов). Язык — русский.`;

  const userContent = `Проект: ${ctx.projectName}
Описание: ${ctx.projectDescription ?? "(нет)"}
Всего задач: ${ctx.totalTasks}
Выполнено: ${ctx.doneTasks}
В работе: ${ctx.inProgressTasks}
Просрочено: ${ctx.overdueTasks}
Последняя активность:
${ctx.recentActivityMessages.slice(0, 10).join("\n") || "(нет)"}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.4
  });

  const content = res.choices[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as ProjectSummaryResult;
    if (
      typeof parsed.summary === "string" &&
      Array.isArray(parsed.risks) &&
      Array.isArray(parsed.recommendations)
    ) {
      return {
        summary: String(parsed.summary).trim(),
        risks: parsed.risks
          .filter((r): r is string => typeof r === "string")
          .map((r) => String(r).trim())
          .filter(Boolean),
        recommendations: parsed.recommendations
          .filter((r): r is string => typeof r === "string")
          .map((r) => String(r).trim())
          .filter(Boolean)
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function resolveAssigneeId(
  assigneeNameOrEmail: string | null,
  members: ProjectMemberForAI[]
): string | null {
  if (!assigneeNameOrEmail?.trim()) return null;
  const q = assigneeNameOrEmail.trim().toLowerCase();
  const found = members.find((m) => {
    const name = (m.name ?? "").toLowerCase();
    const email = m.email.toLowerCase();
    return name.includes(q) || email.includes(q) || email === q;
  });
  return found?.id ?? null;
}
