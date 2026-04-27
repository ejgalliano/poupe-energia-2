import { Zap } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const EnergiaPorAssinatura = () => (
  <ProductPageLayout
    title="Energia por Assinatura"
    subtitle="Economize na conta de luz sem instalar nada"
    heroIcon={Zap}
    highlights={["Ideal para empresas e residências do Grupo B (Baixa Tensão)"]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cardsCols: 3,
        cards: [
          "Economia todos os meses na sua conta de luz",
          "Sem investimento, sem obras e sem instalação",
          "Processo 100% digital e simples",
          "Energia limpa e renovável",
          "Liberdade para cancelar (sem fidelidade na maioria dos casos)",
          "Fim das bandeiras tarifárias",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        cards: [
          "Você “assina” uma parte da produção de uma usina solar",
          "Essa usina gera energia e injeta na rede elétrica",
          "A distribuidora transforma isso em créditos na sua conta",
          "Esses créditos reduzem o valor que você paga todo mês",
        ],
      },
      {
        title: "O que não muda",
        bullets: [
          "Sua distribuidora continua a mesma",
          "A energia não muda",
          "Não existe risco de ficar sem energia",
          "Nenhuma alteração na estrutura elétrica",
        ],
      },
    ]}
    finalQuote="Você não instala nada, não investe nada e continua consumindo energia como sempre. A única mudança: sua conta vem mais barata todos os meses."
  />
);

export default EnergiaPorAssinatura;
