import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotaRow {
  id: string;
  empresa_id: string;
  distribuidora_id: string;
  desconto_percentual: number;
  seguranca_juridica: number;
  reputacao_reclame_aqui: number;
  valor_minimo_fatura: number;
  nota_final: number;
  empresas: { nome: string; parceira: boolean; ativa: boolean; tipo_fornecedor: string | null; atende_residencial: boolean; atende_empresarial: boolean } | null;
}

interface FormulaConfig {
  peso_desconto: number;
  peso_sj: number;
  peso_ra: number;
  peso_vm: number;
  vm_melhor: number;
  vm_pior: number;
}

/** Calcula nota_final de uma linha com base na config e no maior desconto da distribuidora */
function calcNota(r: NotaRow, cfg: FormulaConfig, maiorDescontoDist: number): number {
  const desconto = Number(r.desconto_percentual) || 0;
  const sj       = Math.min(10, Math.max(0, Number(r.seguranca_juridica) || 0));
  const ra       = Math.min(10, Math.max(0, Number(r.reputacao_reclame_aqui) || 0));
  const vm       = Number(r.valor_minimo_fatura) || 0;

  // Nota DS = (desconto_empresa / maior_desconto_da_distribuidora) × 10
  // A empresa com maior desconto dentro da distribuidora recebe nota 10
  const notaDS = maiorDescontoDist > 0
    ? Math.min(10, (desconto / maiorDescontoDist) * 10)
    : 0;

  // Nota VM: escala invertida — menor valor mínimo = melhor nota
  const range = cfg.vm_pior - cfg.vm_melhor;
  const notaVM = range > 0
    ? Math.max(0, Math.min(10, ((cfg.vm_pior - vm) / range) * 10))
    : 0;

  const raw = notaDS * cfg.peso_desconto
    + sj     * cfg.peso_sj
    + ra     * cfg.peso_ra
    + notaVM * cfg.peso_vm;

  return Math.round(Math.min(10, Math.max(0, raw)) * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { distribuidora_id } = body as { distribuidora_id: string };

    if (!distribuidora_id || typeof distribuidora_id !== "string") {
      return new Response(
        JSON.stringify({ error: "distribuidora_id is required (use 'ALL' para recalcular tudo)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Ler configuração da fórmula
    const { data: cfgData, error: cfgError } = await supabase
      .from("formula_config")
      .select("peso_desconto, peso_sj, peso_ra, peso_vm, vm_melhor, vm_pior")
      .limit(1)
      .maybeSingle();

    if (cfgError) throw cfgError;

    const cfg: FormulaConfig = cfgData ?? {
      peso_desconto: 0.4,
      peso_sj: 0.3,
      peso_ra: 0.2,
      peso_vm: 0.1,
      vm_melhor: 0,
      vm_pior: 1000,
    };

    // 2. Buscar notas — por distribuidora específica ou TODAS
    const query = supabase
      .from("notas_empresas")
      .select(
        "id, empresa_id, distribuidora_id, desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura, nota_final, empresas(nome, parceira, ativa, tipo_fornecedor, atende_residencial, atende_empresarial)",
      );

    const { data, error } = distribuidora_id === "ALL"
      ? await query
      : await query.eq("distribuidora_id", distribuidora_id);

    if (error) throw error;

    const rows = (data ?? []).filter(
      (r: any) => r.empresas?.ativa !== false,
    ) as NotaRow[];

    // 3. Calcular maior desconto POR DISTRIBUIDORA
    const maiorDescontoPorDist = new Map<string, number>();
    for (const r of rows) {
      const desc = Number(r.desconto_percentual) || 0;
      const atual = maiorDescontoPorDist.get(r.distribuidora_id) ?? 0;
      maiorDescontoPorDist.set(r.distribuidora_id, Math.max(atual, desc));
    }

    // 4. Recalcular cada nota usando o maior desconto da sua distribuidora
    const computed = rows.map((r) => ({
      ...r,
      nota_final: calcNota(r, cfg, maiorDescontoPorDist.get(r.distribuidora_id) ?? 0),
    }));

    // 5. Persistir apenas registros que mudaram
    const updates = computed.filter(
      (r, i) => Number(rows[i].nota_final) !== r.nota_final,
    );

    await Promise.all(
      updates.map((r) =>
        supabase
          .from("notas_empresas")
          .update({ nota_final: r.nota_final })
          .eq("id", r.id),
      ),
    );

    computed.sort((a, b) => b.nota_final - a.nota_final);

    return new Response(
      JSON.stringify({
        rows: computed,
        atualizados: updates.length,
        total: computed.length,
        maiorDescontoPorDist: Object.fromEntries(maiorDescontoPorDist),
        formula: cfg,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("recalc-ranking error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
