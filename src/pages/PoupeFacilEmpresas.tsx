import { Building2 } from "lucide-react";
import ProductPageLayout from "@/components/ProductPageLayout";

const PoupeFacilEmpresas = () => (
  <ProductPageLayout
    title="GD Livre - Empresas"
    subtitle="Economia real na sua conta de energia, sem complicação"
    heroIcon={Building2}
    highlights={["Atende Grupo A (Alta e Média Tensão)"]}
    sections={[
      {
        icon: "fire",
        title: "O que esperar",
        cards: [
          "20% de redução na conta de energia",
          "Sem investimento e sem mudanças na operação",
          "Processo simples, rápido e seguro",
          "Segurança jurídica e previsibilidade de custos",
        ],
      },
      {
        icon: "point",
        title: "Como funciona",
        body:
          "Sua empresa continua com a mesma distribuidora, mas passa a comprar energia de forma mais inteligente dentro do Mercado Livre de Energia. Com uma curadoria entre diferentes fornecedores e negociação profissional, você acessa melhores condições sem precisar entender ou operar esse mercado.",
      },
    ]}
    finalQuote="Você continua operando igual — só que pagando menos."
  />
);

export default PoupeFacilEmpresas;
