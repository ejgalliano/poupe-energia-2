import { Sun } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const UsinasDeInvestimento = () => (
  <ProductPageLayout
    title="Usinas de Investimento"
    subtitle="Transforme energia em renda e patrimônio"
    heroIcon={Sun}
    highlights={[
      "Indicado para empresas e investidores que buscam previsibilidade, proteção e valorização de capital",
    ]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cards: [
          "Receita recorrente com a geração e venda de energia",
          "Retorno previsível no longo prazo",
          "Proteção contra aumento das tarifas de energia",
          "Participação em ativos reais (infraestrutura energética)",
          "Possibilidade de compensar consumo próprio",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        body:
          "Você participa de uma usina de geração (geralmente solar), adquirindo uma fração do projeto. Essa usina produz energia continuamente e gera créditos para reduzir sua conta ou comercializa energia, gerando receita.",
      },
      {
        title: "Para quem faz sentido",
        bullets: [
          "Empresas com caixa para investimento",
          "Grupos empresariais",
          "Investidores que querem ativos reais",
          "Negócios com alto consumo",
        ],
      },
      {
        title: "Segurança",
        bullets: [
          "Projetos regulados pela ANEEL",
          "Contratos de longo prazo",
          "Ativos físicos como base do investimento",
        ],
      },
    ]}
    finalQuote="Você deixa de apenas pagar energia e passa a ganhar com ela."
  />
);

export default UsinasDeInvestimento;
