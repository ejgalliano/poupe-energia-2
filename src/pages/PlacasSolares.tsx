import { Sun } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const PlacasSolares = () => (
  <ProductPageLayout
    title="Placas Solares — Venda e Instalação"
    subtitle="Energia sob controle: reduza custos e conquiste sua independência energética"
    heroIcon={Sun}
    highlights={["Atende Grupo A e B", "Residências, comércios e indústrias"]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cardsCols: 3,
        cards: [
          "Redução drástica na conta de luz — economia de até 95%",
          "Proteção de longo prazo contra os constantes aumentos de tarifa da distribuidora",
          "Retorno rápido do investimento (Payback) com longa vida útil do sistema",
          "Valorização imediata do seu imóvel residencial ou comercial",
          "Sustentabilidade na prática, gerando sua própria energia limpa e renovável",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        cards: [
          "Painéis fotovoltaicos são instalados no seu telhado ou terreno para captar a luz do sol e transformá-la em energia elétrica",
          "Toda a eletricidade gerada alimenta sua propriedade diretamente, reduzindo o consumo da rede",
          "O excedente gerado é injetado na rede pública, gerando créditos que abate o valor da sua próxima conta de luz",
        ],
      },
      {
        title: "Para quem faz sentido",
        bullets: [
          "Casas e empresas com alto consumo de energia diurno (ar-condicionado, maquinários etc.)",
          "Quem busca previsibilidade financeira e quer se livrar das bandeiras tarifárias",
          "Investidores que desejam valorizar o patrimônio e aumentar a margem de lucro do negócio",
          "Consumidores conscientes que priorizam a redução da pegada de carbono",
        ],
      },
    ]}
    finalQuote="Você continua conectado à rede para sua total segurança, mas passa a produzir a sua própria eletricidade. Deixe de ser apenas um pagador de contas e torne-se o dono da sua própria energia."
    seoTitle="Placas Solares — Venda e Instalação | Poupe Energia"
    seoDescription="Instale painéis solares e reduza sua conta de luz em até 95%. Atendemos residências, comércios e indústrias dos Grupos A e B."
  />
);

export default PlacasSolares;
