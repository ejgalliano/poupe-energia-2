import { Button } from "@/components/ui/button";
import CompanyCard, { Company } from "./CompanyCard";

const companies: Company[] = [
  {
    rank: 1,
    name: "Pret Energy",
    discount: "15%",
    legalSecurity: "9,0",
    reputation: "8,9",
    minValue: "R$ 100",
    score: 9.8,
  },
  {
    rank: 2,
    name: "Ambar Energia",
    discount: "12%",
    legalSecurity: "8,0",
    reputation: "8,1",
    minValue: "R$ 250",
    score: 8.7,
  },
  {
    rank: 3,
    name: "Balt Energia",
    discount: "10%",
    legalSecurity: "7,0",
    reputation: "7,9",
    minValue: "R$ 300",
    score: 8.1,
  },
  {
    rank: 4,
    name: "Red Energia",
    discount: "12%",
    legalSecurity: "7,0",
    reputation: "7,6",
    minValue: "R$ 300",
    score: 7.8,
  },
];

const RankingSection = () => {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <header className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-brand-blue leading-tight">
          Compare as Melhores Empresas de Energia no seu Estado e Economize na
          Conta de Luz!
        </h2>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {companies.map((c) => (
          <CompanyCard key={c.name} company={c} />
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <Button
          size="lg"
          className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-bold rounded-xl px-10 shadow-md"
        >
          Ver mais Ofertas
        </Button>
      </div>
    </section>
  );
};

export default RankingSection;
