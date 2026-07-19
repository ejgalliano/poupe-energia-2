# Discussão: Tabela por Faixas de Desconto — 17/07/2026 (em andamento)

> Status: **EM DISCUSSÃO, pausada para retomar depois.** Nada disso foi implementado ainda.
> Documento original do sócio: `COMERCIAL/PARCERIA DE NEGOCIOS/POUPE ENERGIA/📝 Especificação Técnica - Tabela por Faixas.docx`

## Resumo da especificação do sócio

**Problema:** o simulador de economia não reflete a realidade do mercado — cada Empresa
Parceira aplica desconto diferente dependendo da Distribuidora e do valor da fatura do
cliente. Não existe padrão fixo no mercado de Geração Distribuída / Mercado Livre.

**Solução proposta:** tabela `politicas_desconto`, uma linha por combinação
**[Empresa + Distribuidora]**, contendo:

- Até 5 faixas de valor de fatura: `faixa1_min`, `faixa1_max`, `faixa1_desconto` ...
  até `faixa5` (faixas 4 e 5 opcionais, aceitam nulo).
- `campo_bonificacao`: texto livre (ex: "12ª parcela isenta").

**Fluxo de uso:** cliente final só digita o Valor Bruto da Fatura (R$). O sistema
identifica a Distribuidora do usuário + a Empresa simulada, busca a política
correspondente, faz uma checagem sequencial (IF/ELSE) pra achar em qual faixa o valor
cai, aplica o desconto (%) e mostra a mensagem de bonificação.

**Tela de admin:** dropdown Empresa + dropdown Distribuidora, bloco de 5 linhas
(Valor Mínimo | Valor Máximo | Desconto %), campo de texto pra bonificação.

**Pedido do sócio:** cadastrar isso na **tela de "notas"** já existente (mesma tela onde
hoje se gerencia `notas_empresas`/ranking), não numa tela nova separada.

### Tabela de exemplo do documento original

| Campo | Tipo | Exemplo |
|---|---|---|
| faixa1_min | Decimal | R$ 0,00 |
| faixa1_max | Decimal | R$ 500,00 |
| faixa1_desconto | Percentual | 10% |
| faixa2_min | Decimal | R$ 500,01 |
| faixa2_max | Decimal | R$ 1000,00 |
| faixa2_desconto | Percentual | 12% |
| faixa3_min | Decimal | R$ 1000,01 |
| faixa3_max | Decimal | R$ 5000,00 |
| faixa3_desconto | Percentual | 15% |
| faixa4_min / faixa4_max | Decimal | (Opcional — aceitar nulo se não usar) |
| faixa5_min / faixa5_max | Decimal | (Opcional — aceitar nulo se não usar) |

## Análise técnica do Claude (ainda não validada pelo sócio)

1. **Não usar `faixa1_min`...`faixa5_desconto` como 15 colunas fixas na tabela.** Trava o
   sistema em "no máximo 5 faixas" para sempre — mudança futura exigiria migration.
   Recomendação: tabela filha `politicas_desconto_faixas` (`politica_id`, `valor_min`,
   `valor_max`, `desconto_percentual`, `ordem`) — quantidade de faixas fica livre, e a
   busca da faixa certa vira uma única query (`WHERE valor_min <= X AND (valor_max IS
   NULL OR valor_max >= X)`) em vez de um IF/ELSE checando faixa1, faixa2... no código.
   Pra quem opera a tela de admin, visualmente não muda nada.

2. **A spec não define o que acontece acima da última faixa cadastrada.** Exemplo: faixa3
   vai até R$5.000, cliente digita R$8.000 — não há regra. Precisa decidir: aplica o
   desconto da última faixa mesmo assim, ou bloqueia/mostra "fale conosco".

3. **Uma política por [Empresa+Distribuidora] pode gerar bastante retrabalho de cadastro**
   se uma empresa tem o mesmo desconto em várias distribuidoras diferentes. Considerar
   uma opção de "copiar política para outra(s) distribuidora(s)" na tela de admin, ou uma
   distribuidora "padrão/coringa" como fallback.

4. **`notas_empresas` (avaliação/ranking público) é conceitualmente diferente de
   `politicas_desconto` (config comercial privada).** Sem problema em juntar na mesma TELA
   de admin por conveniência de quem opera, mas o dado no banco deveria ficar em tabela
   separada, não misturado dentro de `notas_empresas`.

5. **Pergunta em aberto — a mais importante para dimensionar o trabalho:** essa estrutura
   de faixas é só para o **simulador de economia** (calculadora pública, exibição), ou
   também deve alimentar o `cashback_percentual` único que já existe hoje em `empresas` e
   é usado nos formulários reais de adesão (`AtivarCashback.tsx`, `AdesaoModal.tsx`)? Se
   for só simulador, é uma feature isolada; se precisa mexer no fluxo real de adesão, o
   escopo é maior.

## Próximos passos

- Sócio vai responder aos 5 pontos acima na próxima sessão (prioridade: pontos 1 e 5).
- Depois de alinhado, desenhar a migration (`politicas_desconto` + `politicas_desconto_faixas`)
  e a tela de admin.
