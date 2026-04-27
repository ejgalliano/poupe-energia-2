import { BatteryCharging } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const Bess = () => (
  <ProductPageLayout
    title="Bess – Armazenamento de Energia em Baterias"
    subtitle="Energia sob Controle: reduza custos e elimine riscos operacionais"
    heroIcon={BatteryCharging}
    highlights={[
      "Atende Grupo A e B",
      "Ideal para operações que não podem parar ou que sofrem com picos de tarifa",
    ]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cards: [
          "Redução de custos ao evitar consumo nos horários mais caros",
          "Proteção contra oscilações e quedas de energia",
          "Continuidade operacional imediata",
          "Mais previsibilidade e controle sobre sua conta",
          "Otimização do uso de energia contratada",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        body:
          "Um sistema de baterias é instalado na sua empresa e funciona como um “reservatório de energia”. Ele armazena energia em momentos de menor custo e disponibiliza quando você mais precisa.",
      },
      {
        title: "Para quem faz sentido",
        bullets: [
          "Alto consumo no horário de ponta",
          "Operações que não podem parar",
          "Empresas que sofrem com quedas de energia",
          "Busca previsibilidade de custos",
        ],
      },
    ]}
    finalQuote="Você continua conectado à rede, mas deixa de depender exclusivamente dela. Passa a decidir quando usar energia, quanto pagar e como proteger sua operação."
  />
);

export default Bess;
