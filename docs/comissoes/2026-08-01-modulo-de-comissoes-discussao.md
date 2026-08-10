# Módulo de Comissões — discussão de design e implementação

> Status em 10/08/2026: **Fases 1, 2 e 3 implementadas** (commits `3ebe763`, `cc380b6`,
> `0e28e97`). Plano completo de 4 fases em
> `C:\Users\Usuario\.claude\plans\rustling-tumbling-pie.md`. Falta só a geração automática
> da comissão recorrente do Grupo A (pendente de definição de regra com o sócio, ver seção
> da Fase 3) e a Fase 4 (relatórios).
> Documento original do sócio: `COMERCIAL/PARCERIA DE NEGOCIOS/POUPE ENERGIA/COMISSOES/Módulo de Comissões – Sistema Poupe Energia.docx`

## Fase 1 — Fundação (implementada 10/08/2026, commit `3ebe763`)

- Migration `supabase/migrations/20260810113403_commission_policy.sql` (usuário ainda
  precisa rodar no Supabase SQL Editor — sem token de acesso ao banco):
  - Tabela nova `commission_policy`: versionada por `service_type` ('GD_A'/'GD_B'), com
    `fcp_percent`, `representative_percent`, `recurring`, `trigger_event`,
    `vigente_desde`/`ativo`. Só uma linha ativa por `service_type` (índice único parcial).
    Seed: GD_B (fcp=48%, rep=50%, único, no primeiro pagamento) e GD_A (fcp=null, rep=50%,
    recorrente, a cada recebimento mensal). RLS: só `gestor`+ enxerga/edita, zero acesso
    público (não tem uso no site).
  - `leads_embaixadores` estendida: `lead_id` agora opcional, + `cashback_cadastro_id`
    (FK pra `cashback_cadastros`), `commission_policy_id`, `mes_referencia` (parcelas
    mensais do Grupo A), `grupo_tarifario`. Constraint exige pelo menos uma origem
    (`lead_id` ou `cashback_cadastro_id`).
- Aba nova "Política de Comissão" em `/admin/embaixadores`
  (`src/pages/admin/Embaixadores.tsx`) — mostra as 2 políticas ativas, editar abre um
  formulário que salva como **versão nova** (desativa a antiga, insere uma nova com
  `vigente_desde = agora`), nunca sobrescreve em cima.
- **Zero mudança de comportamento público** — só schema novo (aditivo) e uma tela de admin.
- Verificado: `tsc --noEmit` limpo, `eslint` sem novos erros (baseline de 9 erros
  pré-existentes de `any` mantido), `vite build` de produção passou.

## Fase 2 — Captura de dados manuais (implementada 10/08/2026, commit `cc380b6`)

- Migration `supabase/migrations/20260810122500_fatura_detalhamento_e_comissao_mensal.sql`
  (usuário ainda precisa rodar no Supabase SQL Editor):
  - Tabela nova `fatura_detalhamento`: 1 linha por `cashback_cadastro_id` (unique), com os
    10 itens não comissionáveis do doc do sócio (CIP, juros, multa, bandeira, uso de rede,
    tributos, parcelamentos, terceiros, extraordinários, outros), `grupo_tarifario`
    ('A'/'B'), e `valor_elegivel`/`fcp_value`/`comissao_sugerida` calculados no app e
    guardados pra auditoria (não geram comissão de verdade ainda — isso é Fase 3). RLS
    igual à de `commission_policy` (só gestor+).
  - Tabela nova `fornecedora_comissao_mensal`: ledger mensal por `empresa_id` +
    `mes_referencia` (unique juntos), com valor recebido/tributos/líquido — alimenta o
    cálculo recorrente do Grupo A na Fase 3. Mesma RLS.
- Tela nova dentro de `/admin/cashback/:id` (`CashbackDetalhe.tsx`) — card "Detalhamento da
  fatura e comissão": a equipe olha o arquivo da fatura (já linkado ali mesmo) e lança os
  itens + Grupo A/B; valor elegível/FCP/comissão sugerida do Grupo B aparecem calculados em
  tempo real usando a política ativa. Pro Grupo A, mostra aviso de que o cálculo vem do
  lançamento mensal por fornecedora, não desta tela.
- Aba nova "Comissão Recebida" em `/admin/parceiros` (`Parceiros.tsx`) — formulário pra
  lançar mês a mês quanto cada fornecedora pagou de comissão, com histórico em tabela.
- **Nenhuma das duas telas gera comissão pro parceiro automaticamente ainda** — só captura
  e guarda os dados-base, exatamente como o plano previu pra esta fase.
- Verificado: `tsc --noEmit` limpo, `eslint` sem novos erros (baseline mantido nos dois
  arquivos), `vite build` de produção passou. Não foi possível testar visualmente no
  navegador nesta sessão por um bug de tooling não relacionado (ver
  `project_poupe_energia_repo.md` na memória do Claude — o preview local serve o projeto
  errado por causa do cwd). **Esse bug foi corrigido na Fase 3** (ver abaixo).

## Fase 3 — Corrige o bug de vínculo (implementada 10/08/2026, commit `0e28e97`)

- Migration `supabase/migrations/20260810124000_override_comissao_parceiro.sql` (usuário
  ainda precisa rodar): `embaixadores.comissao_percentual` deixa de ser `NOT NULL DEFAULT 0`
  e vira override **opcional** por parceiro do `representative_percent` da política ativa —
  nulo = usa o padrão da política. A migration zera os valores existentes (todos vinham do
  antigo 5% fixo, documentado como provisório desde 01/08 — nenhum representava uma decisão
  real de override).
- **Corrigido um bug latente:** `aprovarCandidato()` em `Embaixadores.tsx` gravava
  `comissao_percentual: 5` em todo parceiro novo aprovado. Sem a correção acima, isso teria
  **sobrescrito silenciosamente** a política real (48%/50%) da Fase 1 pra todo parceiro
  aprovado dali pra frente — um bug que só seria percebido quando alguém notasse comissões
  calculadas muito abaixo do esperado. Agora grava `null` (usa a política).
- `AdesaoModal.tsx` e `Aderir.tsx`: campo "Código do parceiro" agora valida contra
  `embaixadores` via `ilike` (mesmo padrão de `LeadCaptureDialog.tsx`), com feedback visual
  em tempo real (loading/válido com nome do parceiro/inválido). Ao enviar a adesão com
  código válido, cria a linha em `leads_embaixadores` via `cashback_cadastro_id` (não mais
  só `lead_id`), status `pendente`, sem valor ainda. Isso corrige o bug original mapeado em
  21/07/2026: o fluxo mais usado (adesão direta) nunca gerava vínculo rastreável.
- `CashbackDetalhe.tsx`: ao salvar o detalhamento da fatura de uma adesão do **Grupo B** com
  parceiro vinculado, calcula a comissão final (FCP × % do parceiro — usa o override se
  tiver, senão o padrão da política) e **atualiza automaticamente** `valor_comissao` na
  linha de `leads_embaixadores` vinculada. O status continua `pendente` — validar e marcar
  como pago continua manual. Mostra no card qual parceiro está vinculado e se o % usado é
  override ou padrão.
- **Não implementado nesta fase (decisão consciente):** geração automática da comissão
  recorrente do Grupo A a partir de `fornecedora_comissao_mensal`. Existe uma ambiguidade
  de negócio não resolvida: o valor lançado ali representa o total que a fornecedora pagou
  no mês (somando todos os clientes Grupo A dela — precisaria de uma regra de rateio entre
  parceiros) ou é por cliente/indicação específica (precisaria vincular o lançamento a uma
  adesão, não só a fornecedora+mês)? Perguntei ao usuário via pergunta estruturada e não
  houve resposta ainda nesta sessão — **fica pendente até essa regra ser definida com o
  sócio**. Enquanto isso, o Grupo A não gera comissão automática nenhuma (nem manual — isso
  ficaria pra quando essa parte for desenhada).
- **Bug de tooling do preview local corrigido nesta fase:** a config `poupe-energia` em
  `.claude/launch.json` (na pasta `ProjetoInicial`) rodava `node vite.js` diretamente, que
  herdava o cwd da sessão e servia o projeto errado (ver histórico em
  `project_poupe_energia_repo.md`). Trocado pra `powershell -Command "Set-Location ...;
  node vite.js"`, que força o diretório certo antes de subir o servidor. Testado e
  funcionando — permitiu validar ao vivo no navegador (contra o Supabase real) que o código
  de parceiro válido mostra o nome e o inválido mostra "Código não encontrado" no
  `AdesaoModal`.
- Verificado: `tsc --noEmit` limpo, `eslint` sem novos erros (baseline mantido nos 4
  arquivos tocados), `vite build` de produção passou, teste manual no navegador (validação
  do código de parceiro, ver acima). Não testei o fluxo completo de submissão (exige upload
  de arquivo, que a ferramenta de navegador automatizado não suporta bem) — a lógica de
  criação do vínculo no submit segue exatamente o mesmo padrão já testado no
  `LeadCaptureDialog.tsx` existente.

Usuário foi explícito: **"desenvolvimento pesado, importante e de risco, precisamos ser
assertivos"** — combinado não implementar nada até o design estar redondo.

## O modelo de comissão (do documento do sócio)

**GD Grupo B** (a maioria das adesões hoje, via `AdesaoModal`/`Aderir`) — comissão **única**,
paga no primeiro pagamento confirmado:

```
Valor Elegível = Valor da Fatura − itens não comissionáveis
                 (CIP, juros, multa, bandeira tarifária, uso de rede, tributos,
                  parcelamentos, terceiros, valores extraordinários)
FCP (Fator Compensável Poupe) = Valor Elegível × 48%
Comissão do Parceiro = FCP × 50%
```

Exemplo do documento: fatura R$1.380,00, itens não elegíveis R$180,00 (CIP 45 + Juros 18 +
Bandeira 22 + Terceiros 95) → elegível R$1.200,00 → FCP R$576,00 → **comissão R$288,00**.

**GD Livre Grupo A** (Mercado Livre, clientes maiores) — comissão **recorrente mensal**,
enquanto a fornecedora continuar pagando comissão pra Poupe:

```
FCP = Comissão que a fornecedora pagou pra Poupe − tributos
Comissão do Parceiro = FCP × 50%
```

O documento recomenda parametrizar 48%/50%/percentual da fornecedora numa tabela
`commission_policy` em vez de fixar em código — o sócio confirmou que quer isso, porque os
valores podem mudar no futuro.

## Perguntas levantadas e respostas já obtidas (01/08/2026)

1. **Detalhamento da fatura (CIP/juros/bandeira/terceiros) — sem extração automática.**
   O cliente manda foto legível da fatura; a **equipe da Poupe lança manualmente** os
   valores. Vai precisar de uma tela de admin nova pra isso (não existe hoje).

2. **Identificação de Grupo A x Grupo B — sem campo hoje, precisa criar.**
   Primeira hipótese testada e **descartada**: classificar por fornecedora (já que o site
   separa "GD Livre/Mercado Livre" de "Energia por Assinatura" como produtos distintos).
   O usuário corrigiu: a maioria das fornecedoras atende os dois grupos ao mesmo tempo, só
   pouquíssimas são exclusivas de um ou outro — então não dá pra inferir pela fornecedora.
   **Solução acordada:** a classificação Grupo A/B vira mais um campo no mesmo formulário
   manual onde a equipe já vai lançar o detalhamento da fatura (item 1) — a fatura já
   mostra isso claramente (Grupo A tem "demanda contratada/faturada" em kW; Grupo B não
   tem, só kWh). Não é trabalho extra, é o mesmo lançamento.

3. **Valor que a fornecedora pagou pra Poupe (`commission_received`) — também não é
   automático.** A equipe olha o portal da fornecedora e lança manualmente no sistema, pra
   ter controle centralizado. Vai precisar de outra tela de admin (lançamento mensal por
   fornecedora).

4. **Respondido em 10/08/2026:** a comissão do Grupo A é recorrente mês a mês, enquanto a
   fornecedora continuar pagando comissão pra Poupe (não tem prazo fixo). Já implementado
   assim na Fase 1 (`recurring: true`, `trigger_event: MONTHLY_RECEIPT`).

5. **Respondido em 10/08/2026:** o FCP de 48% pode variar no futuro. Já implementado como
   parametrizável e versionado na Fase 1 (`commission_policy`, editável em
   `/admin/embaixadores` → aba Política de Comissão). A granularidade é por `service_type`
   (GD_A/GD_B), igual pra todas as fornecedoras — o documento original do sócio já modelava
   assim (uma linha de FCP por serviço, não por fornecedora), então não ficou pendente.

6. O antigo `embaixadores.comissao_percentual = 5%` fixo (usado hoje quando aprova um
   candidato a parceiro) **era só provisório** — essa regra sendo definida agora é a de
   verdade.

7. Confirmado: essa regra cobre **as duas comissões** que faltavam desde o início — a do
   parceiro vendedor (fórmula do FCP) e a que a Poupe recebe da fornecedora parceira
   (`supplier_commission`, ex: 4% — já existe hoje como `comissao_percentual` em
   `parceiros_config`/`/admin/parceiros`, mas fixo; precisa virar parametrizável também).

## O que essa implementação vai exigir (mapeado, ainda não construído)

Três frentes que não existem hoje no sistema:

1. **Tela de admin pra lançar detalhamento da fatura por adesão** (CIP, juros, bandeira,
   terceiros, + classificação Grupo A/B) — provavelmente ligada a `cashback_cadastros` ou
   uma tabela nova relacionada a ela.
2. **Tela de admin pra lançar, mês a mês, quanto cada fornecedora pagou de comissão pra
   Poupe** — ledger mensal por fornecedora.
3. **Rastreamento de comissão recorrente mensal** pro Grupo A — hoje `leads_embaixadores`
   só guarda um `valor_comissao` único por indicação (modelo "uma vez só"), não um
   histórico continuado mês a mês. É mudança de modelo de dados, não só um campo novo.

Mais:

4. Tabela `commission_policy` parametrizável (`fcp_percent`, `representative_percent`, por
   `service_type` — GD_A/GD_B — e possivelmente por fornecedora).
5. Conectar isso ao bug original já mapeado (abaixo): hoje `AdesaoModal`/`Aderir` nem
   validam nem vinculam o código de parceiro a `leads_embaixadores`.

## Contexto original do bug (achado em 21/07/2026, ainda válido)

Existem dois sistemas de captura de indicação de parceiro que **nunca foram conectados**:

1. **Fluxo "Solicitar parceria"** (`LeadCaptureDialog.tsx`) — valida o código contra
   `embaixadores`, cria vínculo em `leads_embaixadores`. É a única fonte que os relatórios
   do admin (`Embaixadores.tsx`) leem hoje.
2. **Fluxo "Contratar pela Poupe"** (`AdesaoModal.tsx`/`Aderir.tsx`) — o código de parceiro
   é texto livre sem validação, salvo em `cashback_cadastros.codigo_embaixador`, nunca gera
   vínculo em `leads_embaixadores`. `AtivarCashback.tsx` nem tem esse campo.

Consequência: nenhuma adesão pelo fluxo mais comum gera comissão rastreável hoje.

## Próximos passos

- Usuário confirma com o sócio os itens 4 e 5.
- Depois disso, desenhar o schema (tabelas novas + extensão de `leads_embaixadores` ou
  equivalente) **antes** de escrever qualquer código, dado o risco explicitamente
  sinalizado pelo usuário.
