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
  empresas: { nome: string; parceira: boolean; ativa: boolean } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { distribuidora_id } = await req.json();
    if (!distribuidora_id || typeof distribuidora_id !== "string") {
      return new Response(
        JSON.stringify({ error: "distribuidora_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("notas_empresas")
      .select(
        "id, empresa_id, distribuidora_id, desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura, nota_final, empresas(nome, parceira, ativa)",
      )
      .eq("distribuidora_id", distribuidora_id);

    if (error) throw error;

    const rows = (data ?? []).filter(
      (r: any) => r.empresas?.ativa !== false,
    ) as NotaRow[];

    const maiorDesconto = rows.reduce(
      (m, r) => Math.max(m, Number(r.desconto_percentual) || 0),
      0,
    );

    const computed = rows.map((r) => {
      const desconto = Number(r.desconto_percentual) || 0;
      const sj = Number(r.seguranca_juridica) || 0;
      const ra = Number(r.reputacao_reclame_aqui) || 0;
      const vm = Number(r.valor_minimo_fatura) || 0;

      const notaDS = maiorDesconto > 0 ? (desconto / maiorDesconto) * 10 : 0;
      const notaVM = Math.max(0, Math.min(10, ((1000 - vm) / 900) * 10));
      const notaFinal =
        notaDS * 0.4 + sj * 0.3 + ra * 0.2 + notaVM * 0.1;
      const rounded = Math.round(notaFinal * 100) / 100;

      return { ...r, nota_final: rounded };
    });

    // Persist updates only when value changed
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

    return new Response(JSON.stringify({ rows: computed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("recalc-ranking error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
