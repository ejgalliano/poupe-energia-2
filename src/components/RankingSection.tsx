import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company } from "./CompanyCard";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  distribuidoraId: string;
  distribuidoraNome: string;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const RankingSection = ({ distribuidoraId, distribuidoraNome }: Props) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!distribuidoraId) return;
    setLoading(true);
    supabase
      .from("notas_empresas")
      .select(
        "desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura, nota_final, empresas(nome)"
      )
      .eq("distribuidora_id", distribuidoraId)
      .order("nota_final", { ascending: false })
      .then(({ data }) => {
        const mapped: Company[] = (data ?? []).map((row: any, idx: number) => ({
          rank: idx + 1,
          name: row.empresas?.nome ?? "Empresa",
          discount: `${Number(row.desconto_percentual)}%`,
          legalSecurity: Number(row.seguranca_juridica).toFixed(1).replace(".", ","),
          reputation: Number(row.reputacao_reclame_aqui).toFixed(1).replace(".", ","),
          minValue: formatBRL(Number(row.valor_minimo_fatura)),
          score: Number(row.nota_final),
        }));
        setCompanies(mapped);
        setLoading(false);
      });
  }, [distribuidoraId]);

  return (
    <section id="ranking" className="container mx-auto px-4 pb-16 pt-4 md:pt-6">
      <header className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-brand-blue leading-tight">
          Compare as Melhores Empresas de Energia para {distribuidoraNome}
        </h2>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {loading && (
          <p className="text-center text-muted-foreground">Carregando ofertas...</p>
        )}
        {!loading && companies.length === 0 && (
          <p className="text-center text-muted-foreground">
            Ainda não temos ofertas cadastradas para esta distribuidora.
          </p>
        )}
        {companies.map((c) => (
          <CompanyCard key={c.name} company={c} />
        ))}
      </div>

      {companies.length > 0 && (
        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-bold rounded-xl px-10 shadow-md"
          >
            Ver mais ofertas
          </Button>
        </div>
      )}
    </section>
  );
};

export default RankingSection;
