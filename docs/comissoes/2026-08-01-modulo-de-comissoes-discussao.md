# Módulo de Comissões — discussão de design — 01/08/2026

> Status: **EM DISCUSSÃO, pausada para retomar depois.** Nada foi implementado ainda.
> Documento original do sócio: `COMERCIAL/PARCERIA DE NEGOCIOS/POUPE ENERGIA/COMISSOES/Módulo de Comissões – Sistema Poupe Energia.docx`

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

4. **Se a comissão do Grupo A é realmente recorrente mês a mês por cliente,
   indefinidamente** — usuário vai confirmar com o sócio. **Pendente.**

5. **Se o FCP de 48% é fixo pra Poupe inteira ou pode variar** — usuário vai confirmar com
   o sócio. **Pendente** (mas de qualquer forma vai numa tabela parametrizável; o que falta
   confirmar é a granularidade — só por serviço, ou também por fornecedora).

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
