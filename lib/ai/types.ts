export type CreateTaskDraft = {
  title: string;
  description: string | null;
  assigneeNameOrEmail: string | null;
  deadline: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
};

export type ImproveDescriptionResult = {
  description: string;
};

export type SuggestSubtasksResult = {
  subtasks: string[];
};

export type ProjectSummaryResult = {
  summary: string;
  risks: string[];
  recommendations: string[];
};
