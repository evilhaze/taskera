import { z } from "zod";

const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(500),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().optional().nullable(),
  deadline: z.string().optional().nullable().or(z.literal("")),
  priority: taskPriorityEnum.optional().default("MEDIUM"),
  status: taskStatusEnum.optional().default("TODO")
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  deadline: z.string().optional().nullable().or(z.literal("")),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  order: z.number().int().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
