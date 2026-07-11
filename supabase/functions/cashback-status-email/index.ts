import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Poupe Energia <noreply@poupeenergia.com.br>";
const SITE_URL = "https://poupeenergia.com.br";
const WHATSAPP = "https://wa.me/5543996796546";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface CashbackRecord {
  id: string;
  nome: string;
  email: string;
  status: string;
  chave_pix: string | null;
  valor_cashback: number | null;
  empresa_nome: string | null;
  distribuidora_nome: string | null;
  cashback_percentual: number | null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: CashbackRecord;
  old_record?: CashbackRecord;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  return res.json();
}

function layout(body: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f4f8; }
    .wrap { max-width: 580px; margin: 32px auto; }
    .header { background: #1E3A5F; padding: 24px 32px; border-radius: 12px 12px 0 0; text-align: center; }
    .header-title { color: #FACC15; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-top: 8px; }
    .logo-bolt { font-size: 28px; }
    .body { background: #fff; padding: 32px; color: #333; font-size: 15px; line-height: 1.7; }
    .footer { background: #f9f9f9; border-top: 1px solid #eee; border-radius: 0 0 12px 12px; padding: 18px 32px; text-align: center; font-size: 12px; color: #999; }
    .btn { display: inline-block; background: #1E3A5F; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 22px; }
    .btn-wa { display: inline-block; background: #25D366; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 12px; }
    p { margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo-bolt">⚡</div>
      <div class="header-title">Poupe Energia</div>
    </div>
    <div class="body">
      ${body}
      <div style="margin-top: 24px;">
        <a href="${WHATSAPP}" class="btn-wa">💬 Falar no WhatsApp</a>
        &nbsp;
        <a href="${SITE_URL}" class="btn">Ver Portal</a>
      </div>
    </div>
    <div class="footer">
      Poupe Energia — Compare, escolha e economize na conta de luz.<br>
      Você recebeu este email porque fez um cadastro em poupeenergia.com.br.
    </div>
  </div>
</body>
</html>`;
}

function textToHtml(text: string): string {
  return text
    .split("\n\n")
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function replaceVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { type, record, old_record } = payload;

    if (type === "DELETE") return new Response("ok");

    const isNew = type === "INSERT";
    const statusChanged = !isNew && old_record?.status !== record.status;

    if (!isNew && !statusChanged) return new Response("no status change");
    if (!record.email) return new Response("no email on record");

    const statusKey = isNew ? "pendente" : record.status;

    const { data: template, error } = await supabase
      .from("email_templates")
      .select("assunto, mensagem, ativo")
      .eq("status", statusKey)
      .single();

    if (error || !template) {
      console.log("Template not found for status:", statusKey);
      return new Response("no template for: " + statusKey);
    }

    if (!template.ativo) {
      return new Response("template disabled for: " + statusKey);
    }

    const vars: Record<string, string> = {
      nome:          record.nome.split(" ")[0],
      nome_completo: record.nome,
      empresa:       record.empresa_nome ?? "",
      distribuidora: record.distribuidora_nome ?? "",
      percentual:    record.cashback_percentual ? `${record.cashback_percentual}%` : "",
      valor_cashback: record.valor_cashback
        ? `R$ ${record.valor_cashback.toFixed(2).replace(".", ",")}`
        : "",
      chave_pix: record.chave_pix ?? "",
    };

    const assunto = replaceVars(template.assunto, vars);
    const html = layout(textToHtml(replaceVars(template.mensagem, vars)));

    const result = await sendEmail(record.email, assunto, html);
    console.log("Resend response:", JSON.stringify(result));

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
