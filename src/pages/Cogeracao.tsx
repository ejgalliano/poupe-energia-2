import { Flame } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const Cogeracao = () => (
  <ProductPageLayout
    title="Cogeração"
    subtitle="Energia Inteligente 2 em 1: reduza custos e ganhe eficiência operacional"
    heroIcon={Flame}
    highlights={[
      "Atende Grupo A e B",
      "Ideal para negócios com uso de água quente ou processos térmicos",
    ]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cards: [
          "Redução significativa nos custos com energia elétrica e gás",
          "Produção própria de energia, total ou parcial",
          "Sem investimento inicial, sem obras e sem preocupação com operação",
          "Mais previsibilidade e controle sobre seus custos energéticos",
          "Ganho de eficiência energética e competitividade",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        body:
          "Um equipamento é instalado no seu local e utiliza gás natural para gerar energia elétrica. O calor gerado nesse processo, que normalmente seria perdido, é reaproveitado para aquecimento de água ou uso produtivo.",
      },
      {
        title: "Para quem faz sentido",
        bullets: [
          "Indústrias",
          "Hotéis",
          "Hospitais",
          "Academias e clubes",
          "Condomínios e lavanderias",
        ],
      },
    ]}
    finalQuote="Você continua operando normalmente, mas passa a gerar energia com mais eficiência, reduzir custos e transformar energia em vantagem competitiva."
  />
);

export default Cogeracao;
