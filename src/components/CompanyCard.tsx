import { useState } from "react";
import { Zap, FileText, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import EconomySimulator from "@/components/EconomySimulator";

export interface Company {
  rank: number;
  name: string;
  discount: string;
  legalSecurity: string;
  reputation: string;
  minValue: string;
  score: number;
  partner?: boolean;
  estado?: string;
  distribuidora?: string;
}

interface Props {
  company: Company;
}

const ordinal = (n: number) => `${n}º`;

const CompanyCard = ({ company }: Props) => {
  const isTop1 = company.rank === 1;
  const initial = company.name.trim().charAt(0).toUpperCase();
  const [searchParams] = useSearchParams();
  const [simOpen, setSimOpen] = useState(false);
  const discountNumber = parseFloat(
    String(company.discount).replace("%", "").replace(",", ".")
  ) || 0;
  const detailHref = `/empresa/${slugify(company.name)}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const metrics = [
    { label: "Desconto Inicial", value: company.discount },
    { label: "Segurança Jurídica", value: company.legalSecurity },
    { label: "Reputação Reclame Aqui", value: company.reputation },
    { label: "Valor Mínimo para Adesão", value: company.minValue },
  ];

  return (
    <article
      className={`relative bg-white rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow ${
        isTop1 ? "border-2 border-brand-success" : "border border-border"
      }`}
    >
      {/* Badge canto superior esquerdo */}
      {isTop1 ? (
        <div className="absolute -top-3 left-5 bg-brand-success text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          Melhor empresa
        </div>
      ) : (
        <div className="absolute -top-3 left-5 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-border">
          {ordinal(company.rank)}
        </div>
      )}

      {/* Linha 1: Logo + Nome + Tags + Nota */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="h-12 w-12 shrink-0 rounded-lg bg-brand-blue/10 flex items-center justify-center">
            <span className="text-xl font-extrabold text-brand-blue">
              {initial}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-extrabold text-brand-blue leading-tight truncate">
              {company.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {company.estado && (
                <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                  {company.estado}
                </span>
              )}
              {company.distribuidora && (
                <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                  {company.distribuidora}
                </span>
              )}
              <Link
                to={detailHref}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
              >
                <FileText className="h-3 w-3" />
                Saiba mais
              </Link>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-md">
                <ShieldCheck className="h-3 w-3" />
                Risco Baixo
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-3xl md:text-4xl font-extrabold text-brand-blue leading-none">
            {company.score.toFixed(1).replace(".", ",")}
          </div>
          <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">
            Nota Final
          </div>
        </div>
      </div>

      {/* Linha 2: Métricas com divisórias */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-border rounded-xl overflow-hidden mb-5">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`p-3 text-center ${
              i < metrics.length - 1 ? "md:border-r border-border" : ""
            } ${i % 2 === 0 ? "border-r md:border-r" : ""} ${
              i < 2 ? "border-b md:border-b-0" : ""
            }`}
          >
            <div className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight mb-1">
              {m.label}
            </div>
            <div className="text-base md:text-lg font-extrabold text-brand-blue">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tag cashback (parceiras) */}
      {company.partner && (
        <div className="inline-flex items-center gap-1.5 bg-brand-yellow/20 text-brand-blue px-3 py-1 rounded-full text-xs font-bold mb-3">
          ⚡ 10% de cashback na adesão
        </div>
      )}

      {/* Linha 3: CTA */}
      <Button
        onClick={() => setSimOpen(true)}
        className="w-full h-12 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90"
      >
        <Zap className="h-4 w-4 mr-2" fill="currentColor" />
        Ver minha economia com {company.name}
      </Button>

      <EconomySimulator
        open={simOpen}
        onOpenChange={setSimOpen}
        companyName={company.name}
        discountPercent={discountNumber}
      />
    </article>
  );
};

export default CompanyCard;
