import { supabase } from "@/integrations/supabase/client";

export type LeadEvento = "clique_aderir" | "clique_saiba_mais";

export interface TrackLeadParams {
  empresaId: string;
  distribuidoraId?: string | null;
  estadoSigla?: string | null;
  evento: LeadEvento;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
}

/** Hash leve do user-agent + timestamp do dia (privacidade — sem IP real no cliente). */
const hashIp = async (): Promise<string> => {
  try {
    const seed = `${navigator.userAgent}|${new Date().toISOString().slice(0, 10)}`;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
    return Array.from(new Uint8Array(buf))
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "anon";
  }
};

/** Registra um lead (não bloqueia se falhar). */
export async function registerLead(params: TrackLeadParams): Promise<void> {
  const ipHash = await hashIp();
  try {
    await supabase.from("leads").insert({
      empresa_id: params.empresaId,
      distribuidora_id: params.distribuidoraId ?? null,
      estado_sigla: params.estadoSigla ?? null,
      evento: params.evento,
      ip_hash: ipHash,
      user_agent: navigator.userAgent.slice(0, 500),
      nome: params.nome ?? null,
      email: params.email ?? null,
      telefone: params.telefone ?? null,
    } as any);
  } catch (err) {
    console.error("Falha ao registrar lead:", err);
  }
}

/** Busca a URL de redirecionamento (afiliado preferido, fallback site_url). */
export async function getRedirectUrl(empresaId: string): Promise<string | null> {
  try {
    const [{ data: parceiro }, { data: empresa }] = await Promise.all([
      supabase
        .from("parceiros_config")
        .select("url_afiliado, ativo")
        .eq("empresa_id", empresaId)
        .maybeSingle(),
      supabase
        .from("empresas")
        .select("site_url")
        .eq("id", empresaId)
        .maybeSingle(),
    ]);

    if (parceiro?.ativo && parceiro.url_afiliado) return parceiro.url_afiliado;
    return empresa?.site_url ?? null;
  } catch (err) {
    console.error("Falha ao buscar URL:", err);
    return null;
  }
}

/**
 * @deprecated — usar registerLead + getRedirectUrl separadamente para
 * controlar melhor o fluxo de popup. Mantido por compatibilidade.
 */
export async function trackLeadAndGetUrl(
  params: TrackLeadParams
): Promise<string | null> {
  await registerLead(params);
  return getRedirectUrl(params.empresaId);
}
