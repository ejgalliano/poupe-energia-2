import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT = `Analise esta conta de energia elétrica e extraia os dados abaixo em JSON.
Se um campo não estiver visível na conta, retorne null para ele.
Não invente dados. Retorne APENAS o JSON, sem explicações adicionais.

{
  "distribuidora_nome": "nome da distribuidora (ex: Cemig, Copel, Enel, Light, CPFL, Energisa)",
  "estado_sigla": "sigla do estado de duas letras (ex: MG, SP, PR, RJ)",
  "cidade": "cidade do endereço de instalação",
  "nome_titular": "nome completo do titular da conta",
  "cpf_cnpj": "CPF ou CNPJ do titular, somente números sem pontos ou traços",
  "numero_instalacao": "número da instalação ou unidade consumidora (UC)",
  "classe_consumo": "residencial, comercial, industrial ou rural",
  "consumo_kwh": 0,
  "valor_conta": 0.00
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let analise_id: string | null = null;

  try {
    const body = await req.json();
    analise_id = body.analise_id;
    const { arquivo_url, arquivo_tipo } = body;

    if (!analise_id || !arquivo_url || !arquivo_tipo) {
      throw new Error("Parâmetros obrigatórios: analise_id, arquivo_url, arquivo_tipo");
    }

    // Baixa o arquivo do Storage
    const path = arquivo_url.split("/object/public/faturas/")[1]
      ?? arquivo_url.split("/faturas/")[1];

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("faturas")
      .download(path);

    if (downloadError) throw new Error(`Erro ao baixar arquivo: ${downloadError.message}`);

    const buffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let base64 = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      base64 += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    base64 = btoa(base64);

    // Monta o conteúdo para Claude
    const tipo = arquivo_tipo.toLowerCase();
    let contentBlock;

    if (tipo === "pdf") {
      contentBlock = {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      };
    } else {
      const mediaType = tipo === "png" ? "image/png" : "image/jpeg";
      contentBlock = {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      };
    }

    // Chama Claude Haiku (extração estruturada — custo mínimo)
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          { role: "user", content: [contentBlock, { type: "text", text: PROMPT }] },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Erro na API Claude: ${err}`);
    }

    const claudeData = await claudeRes.json();
    const rawText: string = claudeData.content?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude não retornou JSON válido");

    const extracted = JSON.parse(jsonMatch[0]);

    // Tenta encontrar a distribuidora no banco pelo nome extraído
    let distribuidora_id: string | null = null;
    if (extracted.distribuidora_nome) {
      const { data: dist } = await supabase
        .from("distribuidoras")
        .select("id")
        .ilike("nome", `%${extracted.distribuidora_nome}%`)
        .limit(1)
        .maybeSingle();

      if (dist) distribuidora_id = dist.id;
    }

    // Salva os dados extraídos
    await supabase
      .from("analises_fatura")
      .update({
        status: "extraido",
        distribuidora_nome_extraido: extracted.distribuidora_nome ?? null,
        distribuidora_id,
        estado_sigla: extracted.estado_sigla ?? null,
        cidade: extracted.cidade ?? null,
        nome_titular: extracted.nome_titular ?? null,
        cpf_cnpj: extracted.cpf_cnpj ?? null,
        numero_instalacao: extracted.numero_instalacao ?? null,
        classe_consumo: extracted.classe_consumo ?? null,
        consumo_kwh: extracted.consumo_kwh ?? null,
        valor_conta: extracted.valor_conta ?? null,
        dados_brutos_ia: extracted,
      })
      .eq("id", analise_id);

    return new Response(
      JSON.stringify({ success: true, data: extracted, distribuidora_id }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (error) {
    if (analise_id) {
      await supabase
        .from("analises_fatura")
        .update({ status: "erro", erro_mensagem: error.message })
        .eq("id", analise_id);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
