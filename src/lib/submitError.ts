const RATE_LIMIT_PREFIX = "RATE_LIMIT:";

/** Traduz o erro de um insert do Supabase para uma mensagem amigável, tratando o rate limit do backend. */
export function getSubmitErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message ?? "";
  if (message.startsWith(RATE_LIMIT_PREFIX)) {
    return message.slice(RATE_LIMIT_PREFIX.length).trim();
  }
  return fallback;
}
