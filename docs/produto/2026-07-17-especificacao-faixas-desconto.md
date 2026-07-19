# Faixas de Desconto por Empresa+Distribuidora — 17-19/07/2026

> Status: **IMPLEMENTADO em 19/07/2026, commit `6ec2b91`.** Falta rodar a migration manualmente
> no SQL Editor do Supabase (sem token de acesso disponível para aplicar via CLI):
> `supabase/migrations/20260719183828_politicas_desconto_por_faixa.sql`.
> Documento original do sócio: `COMERCIAL/PARCERIA DE NEGOCIOS/POUPE ENERGIA/📝 Especificação Técnica - Tabela por Faixas.docx`

## O que foi implementado (19/07/2026)

O sócio validou os 5 pontos da análise técnica (ver seção abaixo) e pediu implementação fiel à spec:

- **Migration:** tabelas `politicas_desconto` (uma linha por [empresa_id, distribuidora_id] + `bonificacao`) e `politicas_desconto_faixas` (número de faixas livre — `politica_id`, `valor_min`, `valor_max`, `desconto_percentual`, `ordem`). RLS: leitura pública, escrita nível ≥ gestor.
- **`src/pages/admin/Notas.tsx`:** novo card "Política de Desconto por Faixa", reaproveitando os dropdowns Empresa/Distribuidora que já existiam na tela. Política nova pré-preenche 3 faixas com o `desconto_percentual` já cadastrado no ranking (mesmo valor repetido) — o sócio ajusta depois. Validação client-side: sem sobreposição entre faixas, min < max, desconto entre 0–100%.
- **`src/components/EconomySimulator.tsx`:** reescrito por completo. Removidos os 4 botões de seleção manual de faixa por consumo em MWh (comportamento antigo, incompatível com a spec). Agora o único input é o valor da fatura (R$); o sistema busca a política de [empresa+distribuidora] e acha a faixa certa automaticamente. Acima da maior faixa cadastrada, aplica o desconto dela (decisão do sócio). Sem política cadastrada ainda para aquela combinação, cai no `desconto_percentual` do ranking como fallback — para não quebrar empresas ainda não configuradas.
- **`src/components/CompanyCard.tsx`:** parou de passar as props de faixa por MWh (removidas da interface do simulador).
- **Não alterado, por decisão explícita:** a Nota DS do ranking (`notas_empresas.desconto_percentual`) e o fluxo de cashback real na adesão — seguem independentes das novas faixas.
- **Backup:** tag git `pre-faixas-desconto` marca o estado anterior (simulador por MWh) como ponto de restauração. As colunas antigas de MWh em `empresas` continuam intactas no banco, só pararam de ser usadas na UI.
- **Verificação:** testado ao vivo no dev server — simulador abre, calcula corretamente, cai no fallback sem quebrar (a migration ainda não tinha sido aplicada em produção no momento do teste). A tela `/admin/notas` exige login; não foi possível verificar visualmente (sem credenciais), só via typecheck limpo (0 erros).

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

## Respostas do sócio (19/07/2026)

1. Concorda — tabela filha, não colunas fixas.
2. Acima da maior faixa, aplica o desconto dela.
3. Concorda com a preocupação de retrabalho.
4. Concorda — separar no banco, juntar só na tela.
5. Não substitui o cashback — são coisas distintas, convivem.

Ver "O que foi implementado" no topo deste documento para o resultado final.

## Próximos passos

- **Usuário:** rodar a migration `20260719183828_politicas_desconto_por_faixa.sql` no SQL
  Editor do Supabase.
- Depois disso, cadastrar as políticas reais (faixas + bonificação) de cada empresa na tela
  de Notas, substituindo os valores pré-preenchidos automáticos.
