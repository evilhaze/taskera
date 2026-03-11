/** Допустимые эмодзи-аватары (звери) для выбора в профиле */
export const AVATAR_EMOJI_OPTIONS = [
  "🐻", // bear
  "🐱", // cat
  "🐶", // dog
  "🐰", // rabbit
  "🦊", // fox
  "🦉", // owl
  "🦁", // lion
  "🐼"  // panda
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJI_OPTIONS)[number];

export function isAllowedAvatarEmoji(value: string | null | undefined): value is AvatarEmoji {
  if (value == null || value === "") return true;
  return AVATAR_EMOJI_OPTIONS.includes(value as AvatarEmoji);
}
