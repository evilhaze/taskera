/**
 * Maps OpenAI (or similar) API errors to user-facing message and HTTP status.
 * Returns null if the error should be rethrown or handled elsewhere.
 */
export function mapAIErrorToResponse(err: unknown): {
  message: string;
  status: number;
} | null {
  if (!err || typeof err !== "object") return null;
  const o = err as Record<string, unknown>;
  const code = typeof o.code === "string" ? o.code : undefined;
  const status = typeof o.status === "number" ? o.status : undefined;

  if (status === 403 || code === "unsupported_country_region_territory") {
    return {
      message:
        "Сервис AI недоступен в вашем регионе. OpenAI API не поддерживается в этой стране. Используйте VPN или другой провайдер AI.",
      status: 403
    };
  }
  if (status === 401 || code === "invalid_api_key") {
    return {
      message: "Неверный API-ключ OpenAI. Проверьте OPENAI_API_KEY.",
      status: 502
    };
  }
  if (status === 429 || code === "rate_limit_exceeded") {
    return {
      message: "Превышен лимит запросов к AI. Попробуйте позже.",
      status: 429
    };
  }
  return {
    message: "Сервис AI временно недоступен. Попробуйте позже.",
    status: 502
  };
}
