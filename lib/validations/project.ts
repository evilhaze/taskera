import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(200),
  description: z.string().max(2000).optional()
});

export const addMemberSchema = z.object({
  email: z.string().email("Некорректный email")
});

export const removeMemberSchema = z.object({
  userId: z.string().min(1, "userId обязателен")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
