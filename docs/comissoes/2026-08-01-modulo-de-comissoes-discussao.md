# Módulo de Comissões — discussão de design e implementação

> Status em 10/08/2026: **Módulo 100% implementado**, incluindo a geração automática da
> comissão recorrente do Grupo A — commits `3ebe763`, `cc380b6`, `0e28e97`, `ec53d79`,
> `41dafbd`, `bf77338`. O sócio esclareceu o mecanismo de rateio (ver seção "Geração da
> comissão recorrente do Grupo A" abaixo) e a última peça foi implementada no mesmo dia.
> Plano original em `C:\Users\Usuario\.claude\plans\rustling-tumbling-pie.md`.
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
- **Geração automática do Grupo A não implementada nesta fase** por ambiguidade de negócio
  ainda não resolvida na hora — **resolvida no mesmo dia e implementada depois da Fase 4**,
  ver seção própria abaixo.
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

## Fase 4 — Relatórios (implementada 10/08/2026, commit `ec53d79`)

- Aba "Leads por Parceiro Comercial" em `/admin/embaixadores` ganhou colunas de **Origem**
  (Adesão/Cashback vs Solicitação de Parceria — as duas fontes caem na mesma tabela desde a
  Fase 3, então a distinção agora é só de exibição) e **Grupo** (A/B, com o mês de
  referência quando for uma parcela recorrente). Consumidor/email/telefone passam a vir de
  `leads` ou `cashback_cadastros` dependendo da origem (antes só lia `leads`, o que deixava
  em branco todo lead vindo de adesão direta). CSV export e o painel de detalhe do lead
  atualizados do mesmo jeito.
- **Corrigido de quebra:** o `saveFatura()` da Fase 3 só gravava `grupo_tarifario` em
  `fatura_detalhamento`, não em `leads_embaixadores` (que também tem essa coluna, criada na
  Fase 1). Sem isso, os relatórios não teriam como mostrar o grupo sem um join extra. Agora
  grava nos dois lugares.
- Resumo Financeiro não precisou de mudança estrutural — já lê `valor_comissao`, que a Fase
  3 passou a calcular de verdade em vez de ficar sempre em 0.
- Verificado: `tsc --noEmit` limpo, `eslint` sem novos erros (baseline mantido), `vite
  build` de produção passou, query com o novo join (`cashback_cadastros`) validada contra o
  schema real via chave anon (200 OK — um relacionamento inválido teria dado erro
  específico do PostgREST, não 200).

## Geração da comissão recorrente do Grupo A (implementada 10/08/2026, commit `bf77338`)

**Mecanismo esclarecido pelo sócio em 10/08/2026:** o lançamento mensal por fornecedora
(`fornecedora_comissao_mensal`) é sim um valor total (ex: R$5.000 em julho), mas a
fornecedora manda, junto com o pagamento, um **relatório por cliente/UC** discriminando
quanto cada cliente gerou de comissão (ex: Cliente A → R$1.000, Cliente B → R$800...). Duas
perguntas de acompanhamento, também respondidas pelo sócio:

1. **Esse valor por cliente já vem líquido** (sem tributos, iluminação pública, uso de
   rede, ou qualquer coisa que não seja consumo de energia) — ou seja, já é o **FCP direto**
   daquele cliente, sem nenhum cálculo de dedução adicional.
2. **A equipe identifica o parceiro de cada linha pelo número da UC** — o sistema busca a
   adesão por UC e mostra automaticamente qual parceiro já está vinculado a ela (vínculo
   criado na Fase 3, quando a adesão foi cadastrada com um código válido).

**Implementado:**
- Migration `supabase/migrations/20260810133600_itens_comissao_mensal_grupo_a.sql`
  (usuário ainda precisa rodar): tabela nova `fornecedora_comissao_mensal_itens` (1 linha
  por cliente/UC dentro de um lançamento mensal) + índice único
  `(cashback_cadastro_id, mes_referencia)` em `leads_embaixadores`, pra permitir uma linha
  de comissão por mês por adesão no recorrente, sem afetar a linha "base" (mês nulo) criada
  no momento da adesão.
- Em `/admin/parceiros` → aba "Comissão Recebida", nova seção "Detalhamento por
  cliente/UC": a equipe busca cada UC (busca automática do parceiro vinculado), lança o
  valor gerado, e o sistema monta uma lista local desses itens com o total comparado ao
  valor recebido do lançamento (aviso, não bloqueio, se não bater).
- Ao salvar: grava o header + cada item, calcula `comissão do parceiro = valor gerado ×
  representative_percent` (usa o override do parceiro se tiver, senão o padrão da política
  GD_A ativa), e faz upsert em `leads_embaixadores` por `(cashback_cadastro_id,
  mes_referencia)` — cria uma linha nova se for a primeira vez daquele mês, atualiza se já
  existir. **Mesma proteção da Fase 3:** se a comissão daquele mês já estiver
  `validado`/`pago`, não recalcula silenciosamente — avisa e exige ajuste manual.
- Verificado: `tsc --noEmit` limpo, `eslint` sem novos erros (baseline restaurado depois de
  remover casts `as any` desnecessários), `vite build` de produção passou.

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

## Contexto original do bug (achado em 21/07/2026, CORRIGIDO na Fase 3 em 10/08/2026)

Existiam dois sistemas de captura de indicação de parceiro que **nunca foram conectados**:

1. **Fluxo "Solicitar parceria"** (`LeadCaptureDialog.tsx`) — valida o código contra
   `embaixadores`, cria vínculo em `leads_embaixadores`.
2. **Fluxo "Contratar pela Poupe"** (`AdesaoModal.tsx`/`Aderir.tsx`) — o código de parceiro
   era texto livre sem validação, salvo em `cashback_cadastros.codigo_embaixador`, nunca
   gerava vínculo em `leads_embaixadores`.

Consequência: nenhuma adesão pelo fluxo mais comum gerava comissão rastreável. **Corrigido
na Fase 3** — ambos os fluxos agora validam o código e criam o vínculo (via
`cashback_cadastro_id`), e a Fase 4 já atualizou os relatórios pra distinguir a origem.

## Próximos passos

- ✅ Itens 4 e 5 respondidos pelo usuário em 10/08/2026 (ver seção de perguntas acima).
- ✅ Fases 1-4 implementadas em 10/08/2026.
- ✅ Regra de rateio do Grupo A esclarecida pelo sócio e implementada em 10/08/2026 (ver
  seção "Geração da comissão recorrente do Grupo A" acima).
- **Pendente:** usuário rodar as migrations da Fase 3
  (`20260810124000_override_comissao_parceiro.sql`) e da geração do Grupo A
  (`20260810133600_itens_comissao_mensal_grupo_a.sql`) — as demais já foram confirmadas.
- Módulo de comissões implementado por completo. Próximo passo natural é a equipe começar
  a usar (lançar detalhamentos de fatura, comissões recebidas) e ajustar a política em
  `/admin/embaixadores` se os percentuais mudarem.
