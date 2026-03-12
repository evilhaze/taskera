import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

function getClient(): OpenAI | null {
  if (!apiKey?.trim()) return null;
  return new OpenAI({ apiKey });
}

export function getAIClient(): OpenAI | null {
  return getClient();
}

export function isAIAvailable(): boolean {
  return Boolean(apiKey?.trim());
}
