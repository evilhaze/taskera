/**
 * Demo mode: constants and helpers.
 * Demo user is identified by fixed email. No schema change.
 */

export const DEMO_USER_EMAIL = "demo@taskera.demo";

export const DEMO_LIMITS = {
  maxProjects: 3,
  maxTasks: 10
} as const;

export type DemoLimitCode = "DEMO_LIMIT_PROJECTS" | "DEMO_LIMIT_TASKS" | "DEMO_AI_LOCKED";

export function isDemoUser(
  user: { email: string } | null | undefined
): boolean {
  return user?.email === DEMO_USER_EMAIL;
}
