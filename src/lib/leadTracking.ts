import { supabase } from "@/integrations/supabase/client";

export type LeadEvento = "clique_aderir" | "clique_saiba_mais";

export interface TrackLeadParams {
  empresaId: string;
  distribuidoraId?: string | null;
  estadoSigla?: string | null;
  evento: LeadEvento;
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

/**
 * Registra um lead no banco. Retorna a URL para a qual redirecionar
 * (url_afiliado se cadastrada, ou site_url da empresa, ou null).
 */
export async function trackLeadAndGetUrl(
  params: TrackLeadParams
): Promise<string | null> {
  const { empresaId, distribuidoraId, estadoSigla, evento } = params;

  const ipHash = await hashIp();

  // Registra o lead (não bloqueia se falhar)
  try {
    await supabase.from("leads").insert({
      empresa_id: empresaId,
      distribuidora_id: distribuidoraId ?? null,
      estado_sigla: estadoSigla ?? null,
      evento,
      ip_hash: ipHash,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch (err) {
    console.error("Falha ao registrar lead:", err);
  }

  // Busca URL preferindo o afiliado
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
  } catch {
    return null;
  }
}
