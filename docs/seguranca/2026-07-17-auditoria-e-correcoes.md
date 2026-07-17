# Auditoria e correções de segurança — 17/07/2026

Registro da sessão de trabalho com o Claude Code, para não depender só do histórico de chat.

## Contexto

O usuário lembrava de ter feito ajustes de segurança na noite de 16/07/2026 (~19h) mas não
encontrava a conversa. Investigação encontrou o motivo: o trabalho estava no repositório
`poupe-energia-2` (pasta irmã de `ProjetoInicial`, onde as sessões do Claude Code abrem por
padrão). Nada tinha sido perdido — commits e dados intactos, só a sessão de chat que
continha aquele trabalho ficou com um título antigo que não refletia o conteúdo.

**Repositório real do projeto:** `C:\Users\Usuario\Documents\CURSOS\NOCODE STARTUP\poupe-energia-2`
Remote: `github.com/ejgalliano/poupe-energia-2` — branch `main` — deploy automático via Vercel.

## Commits de segurança de 16/07/2026 (já existentes antes desta sessão)

| Hora | Commit |
|---|---|
| 12:28 | Segurança: nível padrão muda de `super_admin` para `visualizador` |
| 19:18 | Rate limiting em todos os formulários públicos (2 camadas) |
| 20:08 | security: add HTTP security headers via Vercel config |
| 20:14 | security: fix 16 npm vulnerabilities via audit fix |

## Trabalho feito nesta sessão (17/07/2026)

### 1. `.env` fora do controle de versão — commit `27413d5`

O `.env` (com as chaves públicas do Supabase — `anon`/`publishable`, seguras de ficar
públicas) estava versionado no Git, sem entrada no `.gitignore`. Corrigido:
- `.env` adicionado ao `.gitignore`, removido do índice do Git (arquivo local mantido).
- Criado `.env.example` com os nomes das variáveis, sem valores.
- Confirmado: as variáveis reais já estavam cadastradas direto no painel da Vercel
  (Project Settings → Environment Variables) desde 7/maio, então a remoção não quebrou o build.
- Confirmado via `git log --all -p`: nenhuma `service_role key` (chave mestra) jamais foi
  commitada no histórico do repositório (que é público no GitHub).

### 2. Rate limiting real, server-side — commit `73bb2e0`

O único rate limiting existente no client (`useRateLimit.ts`, hook baseado em `localStorage`)
era só cosmético — qualquer pessoa contornava limpando o localStorage ou chamando a API do
Supabase direto, sem passar pelo site.

Solução: migration `supabase/migrations/20260717171750_rate_limit_formularios_publicos.sql`,
criando:
- Tabela `public.rate_limit_log` (bucket, identifier, created_at), RLS habilitado sem
  nenhuma policy (bloqueia acesso direto; só a função abaixo consegue ler/escrever).
- Função `enforce_submission_rate_limit()` (SECURITY DEFINER) usada como trigger
  `BEFORE INSERT`, que identifica o remetente por email+telefone e bloqueia reenvio dentro
  do cooldown configurado por tabela.
- Triggers aplicados em:

| Formulário | Tabela | Cooldown |
|---|---|---|
| Adesão / Ativar Cashback | `cashback_cadastros` | 30 min |
| Lead empresarial | `leads_empresariais` | 10 min |
| Solicitar Parceria | `solicitacoes_parceria` | 10 min |
| Contestação | `contestacoes` | 5 min |
| Seja Parceiro | `embaixadores_candidatos` | 1 hora |

Client-side: criado `src/lib/submitError.ts` (helper `getSubmitErrorMessage`) e os 7 pontos
de submit dos formulários (`AdesaoModal.tsx`, `Aderir.tsx`, `AtivarCashback.tsx`,
`BusinessLeadDialog.tsx`, `ExternalSiteModal.tsx`, `Contestacao.tsx`,
`SejaUmEmbaixador.tsx`) atualizados para traduzir o erro `RATE_LIMIT:` do backend em
mensagem amigável.

Migration aplicada manualmente pelo usuário no SQL Editor do Supabase (sem token de acesso
disponível para o Claude rodar via CLI). Confirmado via
`information_schema.triggers`: os 5 triggers existem em produção.

### 3. Auditoria de RLS via `pg_policies` — commit `e76a8fa`

Auditoria completa das políticas RLS de todas as 21 tabelas do schema `public` (consultas
`pg_policies` e `pg_class.relrowsecurity` rodadas pelo usuário no SQL Editor). Achados:

- **Confirmado:** todas as 21 tabelas têm RLS habilitado — nenhuma exposta por falta de RLS.

- **🔴 Crítico — corrigido:** `embaixadores_candidatos` tinha 3 policies soltas
  (`admin_read_candidatos`, `admin_update_candidatos`, `admin_delete_candidatos`, todas
  `using: true`, sem checar nível) rodando em paralelo com a policy correta
  (`admin_all_embaixadores_candidatos`, exige nível ≥ visualizador). Como policies
  permissivas do mesmo comando são combinadas com **OR** no Postgres, essas três liberavam
  SELECT/UPDATE/DELETE de **todos os candidatos a parceiro para qualquer usuário
  autenticado**, independente de cargo. As 3 policies soltas foram removidas.

- **🟡 Médio (já mitigado pelo trigger) — corrigido:** as policies `rate_limit_*` em
  `cashback_cadastros`, `contestacoes`, `leads_empresariais`, `solicitacoes_parceria` e
  `embaixadores_candidatos` — que usavam a função `count_recent_submissions()` — nunca
  bloquearam nada de fato. Pelo mesmo motivo do OR acima: a policy irmã `anon_insert_*`
  tinha `with_check: true` e liberava o INSERT incondicionalmente para o mesmo role,
  anulando a checagem de rate limit. Essas policies mortas foram removidas — a proteção
  real já é o trigger `rate_limit_before_insert` do item 2 (que não sofre desse problema
  por não ser uma RLS policy).

Migration: `supabase/migrations/20260717180000_corrige_rls_embaixadores_e_limpa_rate_limit_morto.sql`.
Também aplicada manualmente pelo usuário no SQL Editor.

**Lição:** o commit `f801fc1` de 16/07 ("Rate limiting em todos os formulários públicos —
2 camadas") já tinha tentado implementar duas camadas de proteção (RLS + client), mas a
camada de RLS nunca funcionou por causa do bug de OR. Só foi descoberto auditando as
policies ao vivo — não dava pra ver isso só lendo o código do client.

## Backlog de segurança — o que ainda falta

1. **CSP com `'unsafe-inline'` e `'unsafe-eval'`** em `script-src` (`vercel.json`) — anula
   boa parte da proteção contra XSS que o CSP deveria dar. Precisa investigar se dá pra
   remover (provavelmente exige tirar scripts inline do código).
2. **2 vulnerabilidades npm remanescentes** (`vite`/`esbuild`, moderada e alta) — o fix
   automático não resolveu porque exige upgrade major do Vite (risco de quebrar o build).
   Só afeta o dev server, não produção.
3. **CORS `Access-Control-Allow-Origin: "*"`** nas Edge Functions — funciona porque a
   autenticação é por token (não cookie), mas seria mais rígido restringir a origem ao
   domínio do site como defesa em profundidade.
