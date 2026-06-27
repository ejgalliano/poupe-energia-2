import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Poupe Energia <onboarding@resend.dev>";
const SITE_URL = "https://poupeenergia.com.br";
const WHATSAPP = "https://wa.me/5543999999999"; // TODO: atualizar com número real

interface CashbackRecord {
  id: string;
  nome: string;
  email: string;
  status: string;
  chave_pix: string | null;
  valor_cashback: number | null;
  empresa_nome: string | null;
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
    .box { background: #FEF9C3; border-left: 4px solid #FACC15; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
    .box-green { background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
    .box-red { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #1E3A5F; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 22px; }
    .btn-wa { display: inline-block; background: #25D366; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 12px; }
    p { margin-bottom: 14px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    strong { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo-bolt">⚡</div>
      <div class="header-title">Poupe Energia</div>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      Poupe Energia — Compare, escolha e economize na conta de luz.<br>
      Dúvidas? Fale com a gente pelo WhatsApp.<br><br>
      Você recebeu este email porque fez um cadastro em poupeenergia.com.br.
    </div>
  </div>
</body>
</html>`;
}

function getEmailContent(
  record: CashbackRecord,
  isNew: boolean
): { subject: string; html: string } | null {
  const nome = record.nome.split(" ")[0];

  if (isNew) {
    return {
      subject: "Recebemos seu cadastro de cashback ⚡ — Poupe Energia",
      html: layout(`
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos seu cadastro no programa de <strong>cashback da Poupe Energia</strong>. 🎉</p>
        <div class="box">
          Nossa equipe irá verificar seus dados junto à comercializadora parceira.
          Em breve você receberá novidades!
        </div>
        <p>O prazo para análise é de até <strong>5 dias úteis</strong>.</p>
        <p>Enquanto isso, acompanhe o ranking das melhores comercializadoras:</p>
        <a href="${SITE_URL}" class="btn">Ver Ranking de Energia</a>
      `),
    };
  }

  switch (record.status) {
    case "em_analise":
      return {
        subject: "Seu cashback está em análise 🔍 — Poupe Energia",
        html: layout(`
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu cadastro de cashback está sendo <strong>analisado</strong> pela nossa equipe.</p>
          <div class="box">
            Estamos verificando seus dados junto à comercializadora parceira.
            O processo pode levar até <strong>3 dias úteis</strong>.
          </div>
          <p>Assim que concluirmos, você receberá um novo email com o resultado. Fique de olho!</p>
          <p>Dúvidas? Entre em contato pelo WhatsApp:</p>
          <a href="${WHATSAPP}" class="btn-wa">💬 Falar no WhatsApp</a>
        `),
      };

    case "aprovado":
      return {
        subject: "Cashback aprovado! ✅ — Poupe Energia",
        html: layout(`
          <p>Olá, <strong>${nome}</strong>! Ótima notícia!</p>
          <p>Seu cashback foi <strong>aprovado</strong>! 🎉</p>
          <div class="box-green">
            O pagamento será realizado via <strong>Pix</strong> em até
            <strong>60 dias</strong> após a validação da sua primeira fatura junto
            à comercializadora parceira.
          </div>
          <p>
            Fique de olho no seu email — você receberá uma confirmação assim que
            o pagamento for realizado.
          </p>
          <p>Obrigado por confiar na <strong>Poupe Energia</strong>! ⚡</p>
        `),
      };

    case "pago": {
      const valor =
        record.valor_cashback != null
          ? `R$ ${record.valor_cashback.toFixed(2).replace(".", ",")}`
          : null;
      const chave = record.chave_pix;
      return {
        subject: "Seu cashback foi pago! 💰 — Poupe Energia",
        html: layout(`
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu cashback foi <strong>pago</strong>! 💸</p>
          <div class="box-green">
            ${valor ? `<strong>Valor enviado: ${valor}</strong><br>` : ""}
            ${chave ? `Chave Pix: <code>${chave}</code>` : ""}
          </div>
          <p>
            O valor foi transferido para a sua chave Pix cadastrada.
            O depósito pode levar até <strong>1 hora</strong> para aparecer na sua conta.
          </p>
          <p>
            Obrigado por participar do programa de cashback da
            <strong>Poupe Energia</strong>! Esperamos te ajudar a economizar cada vez mais. ⚡
          </p>
          <a href="${SITE_URL}" class="btn">Ver mais ofertas de energia</a>
        `),
      };
    }

    case "cancelado":
      return {
        subject: "Atualização sobre seu cashback — Poupe Energia",
        html: layout(`
          <p>Olá, <strong>${nome}</strong>.</p>
          <p>
            Analisamos seu cadastro e, infelizmente, <strong>não foi possível
            processar seu cashback</strong> nesta solicitação.
          </p>
          <div class="box-red">
            Isso pode ter ocorrido por um dos seguintes motivos:
            <ul style="margin-top:8px; padding-left:18px;">
              <li>A adesão com a comercializadora foi realizada antes do cadastro</li>
              <li>Os dados informados não conferem com os registros da comercializadora</li>
              <li>A solicitação não atendeu aos critérios do programa de cashback</li>
            </ul>
          </div>
          <p>
            Se você acredita que houve um engano, entre em contato com nossa equipe.
            Estamos aqui para ajudar!
          </p>
          <a href="${WHATSAPP}" class="btn-wa">💬 Falar no WhatsApp</a>
        `),
      };

    default:
      return null;
  }
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { type, record, old_record } = payload;

    if (type === "DELETE") return new Response("ok");

    const isNew = type === "INSERT";
    const statusChanged = !isNew && old_record?.status !== record.status;

    if (!isNew && !statusChanged) {
      return new Response("no status change");
    }

    if (!record.email) {
      return new Response("no email on record");
    }

    const content = getEmailContent(record, isNew);
    if (!content) return new Response("no template for this status");

    const result = await sendEmail(record.email, content.subject, content.html);
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
