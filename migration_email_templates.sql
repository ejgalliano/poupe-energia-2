-- Tabela de templates de email editáveis pelo admin
CREATE TABLE IF NOT EXISTS email_templates (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status     TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  assunto    TEXT NOT NULL,
  mensagem   TEXT NOT NULL,
  ativo      BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_admin"
  ON email_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Dados iniciais
INSERT INTO email_templates (status, label, assunto, mensagem) VALUES

('pendente', 'Cadastro recebido',
'Recebemos sua solicitação de adesão ⚡ — Poupe Energia',
'Olá, {{nome}}!

Recebemos sua solicitação de adesão ao plano de energia da Poupe Energia. 🎉

Nossa equipe irá analisar seus documentos e entrar em contato em breve. O prazo para análise é de até 5 dias úteis.

Qualquer dúvida, estamos à disposição pelo WhatsApp.'),

('em_analise', 'Em análise',
'Sua adesão está em análise 🔍 — Poupe Energia',
'Olá, {{nome}}!

Sua solicitação de adesão está sendo analisada pela nossa equipe.

Estamos verificando seus documentos junto à comercializadora parceira. O processo pode levar até 3 dias úteis.

Assim que concluirmos, você receberá um novo email. Fique de olho!'),

('cadastrado_parceiro', 'Cadastrado no parceiro',
'Você foi cadastrado na comercializadora ✅ — Poupe Energia',
'Olá, {{nome}}! Ótima notícia!

Seus dados foram cadastrados na comercializadora {{empresa}}. 🎉

O próximo passo é a emissão do seu contrato de adesão ao plano de energia. Você receberá um email assim que o contrato estiver disponível para assinatura.

Nossa equipe está à disposição pelo WhatsApp caso precise de ajuda.'),

('contrato_enviado', 'Contrato enviado',
'Seu contrato está pronto para assinar 📄 — Poupe Energia',
'Olá, {{nome}}!

Seu contrato de adesão ao plano de energia foi gerado e enviado para assinatura digital.

Verifique sua caixa de entrada (e a pasta de spam) por um email com o link para assinar o contrato. A assinatura é rápida e feita pelo celular ou computador.

Após a assinatura, sua adesão ficará ativa e você começará a economizar na conta de luz!'),

('ativo', 'Ativo',
'Sua adesão está ativa! ⚡ — Poupe Energia',
'Olá, {{nome}}! Parabéns!

Sua adesão ao plano de energia com {{empresa}} está ativa! ⚡

A partir de agora você faz parte do plano de créditos de energia com {{percentual}} de cashback na conta de luz.

Acompanhe suas faturas — a economia já começa a aparecer nas próximas contas.

Obrigado por confiar na Poupe Energia!'),

('pago', 'Cashback pago',
'Seu cashback foi pago! 💰 — Poupe Energia',
'Olá, {{nome}}!

Seu cashback foi pago! 💸

Valor enviado: {{valor_cashback}}
Chave Pix utilizada: {{chave_pix}}

O valor foi transferido para a sua chave Pix cadastrada. O depósito pode levar até 1 hora para aparecer na sua conta.

Obrigado por participar do programa de cashback da Poupe Energia!'),

('cancelado', 'Cancelado',
'Atualização sobre sua adesão — Poupe Energia',
'Olá, {{nome}}.

Analisamos seu cadastro e, infelizmente, não foi possível processar sua adesão nesta solicitação.

Isso pode ter ocorrido por um dos seguintes motivos:
- A adesão com a comercializadora foi realizada antes do cadastro
- Os dados informados não conferem com os registros da comercializadora
- A solicitação não atendeu aos critérios do programa

Se você acredita que houve um engano, entre em contato com nossa equipe pelo WhatsApp. Estamos aqui para ajudar!')

ON CONFLICT (status) DO NOTHING;
