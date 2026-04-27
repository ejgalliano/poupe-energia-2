import { TrendingUp } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const MercadoLivreDeEnergia = () => (
  <ProductPageLayout
    title="Mercado Livre de Energia"
    subtitle="Liberdade para escolher e pagar menos pela sua energia"
    heroIcon={TrendingUp}
    sections={[
      {
        icon: "fire",
        title: "O que você ganha",
        cards: [
          "Redução média de 18% a 30% na conta de energia",
          "Liberdade para negociar preços e contratos",
          "Previsibilidade e gestão ativa de custos",
          "Possibilidade de escolher fontes renováveis",
          "Mais competitividade para o seu negócio",
        ],
      },
      {
        icon: "point",
        title: "Quem pode migrar",
        body:
          "Todas as empresas do Grupo A (Alta e Média Tensão) já podem migrar desde 2024.",
        bullets: [
          "Indústrias",
          "Supermercados",
          "Hospitais",
          "Shoppings",
          "Grandes comércios",
          "Centros logísticos",
        ],
      },
      {
        title: "O que não muda",
        bullets: [
          "Distribuidora continua a mesma",
          "Qualidade e fornecimento não mudam",
          "Não há risco de interrupção",
          "Nenhuma obra ou alteração na estrutura",
        ],
      },
    ]}
    finalQuote="Você continua operando normalmente, mas passa a escolher de quem comprar energia — pagando menos e com mais controle."
  />
);

export default MercadoLivreDeEnergia;
