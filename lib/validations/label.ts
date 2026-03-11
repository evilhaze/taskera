import { z } from "zod";

const LABEL_COLORS = [
  "gray",
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "pink"
] as const;

export const labelColorSchema = z.enum(LABEL_COLORS);
export type LabelColor = z.infer<typeof labelColorSchema>;

export const createLabelSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  color: labelColorSchema.default("gray")
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: labelColorSchema.optional()
});

export const taskLabelsSchema = z.object({
  labelIds: z.array(z.string().cuid()).max(20)
});

export const LABEL_COLORS_LIST = LABEL_COLORS;
