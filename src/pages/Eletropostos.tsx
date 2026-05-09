import { Plug } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const Eletropostos = () => (
  <ProductPageLayout
    title="Eletropostos – Carregadores de carros Elétricos"
    subtitle="Transforme mobilidade elétrica em receita recorrente"
    heroIcon={Plug}
    highlights={[
      "Ideal para empresas, proprietários de espaços e investidores",
      "Modelo que permite instalar em locais próprios ou alugados",
    ]}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cards: [
          "Receita recorrente com a recarga de veículos elétricos",
          "Possibilidade de explorar pontos estratégicos com alto fluxo",
          "Aumento do valor e atratividade do espaço",
          "Entrada em um mercado em crescimento acelerado",
          "Posicionamento moderno e sustentável",
        ],
      },
      {
        icon: "point",
        title: "Onde faz sentido",
        bullets: [
          "Shoppings e centros comerciais",
          "Postos de combustível",
          "Supermercados",
          "Hotéis e restaurantes",
          "Grandes condomínios",
          "Estacionamentos e hubs logísticos",
        ],
      },
      {
        title: "Como funciona",
        body:
          "São instalados carregadores em locais estratégicos — próprios ou alugados — onde motoristas podem recarregar seus veículos.",
        bullets: [
          "Monetizar diretamente o uso (cobrança por recarga)",
          "Firmar parcerias com estabelecimentos",
          "Explorar regiões com alta circulação (urbana ou rodoviária)",
        ],
      },
      {
        title: "Segurança e estrutura",
        cards: [
          "Equipamentos modernos e certificados",
          "Instalação adequada à infraestrutura elétrica",
          "Gestão e monitoramento do uso",
          "Suporte técnico especializado",
        ],
      },
      {
        title: "Modelo para investidores",
        body:
          "Você pode investir na instalação de eletropostos em locais estratégicos — inclusive alugando espaços — e gerar receita com a operação de recarga. Não precisa ser dono do imóvel para entrar nesse mercado.",
      },
    ]}
    finalQuote="Você transforma pontos estratégicos em fontes de receita, aproveitando o crescimento dos carros elétricos."
  />
);

export default Eletropostos;
