import { Trophy, Zap, Shield, Star, Wallet, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Company {
  rank: number;
  name: string;
  discount: string;
  legalSecurity: string;
  reputation: string;
  minValue: string;
  score: number;
  partner?: boolean;
}

interface Props {
  company: Company;
}

const CompanyCard = ({ company }: Props) => {
  const isTop1 = company.rank === 1;

  const metrics = [
    { icon: Tag, label: "Desconto na Conta", value: company.discount },
    { icon: Shield, label: "Segurança Jurídica", value: company.legalSecurity },
    { icon: Star, label: "Reputação Reclame Aqui", value: company.reputation },
    { icon: Wallet, label: "Valor Mínimo para Adesão", value: company.minValue },
  ];

  return (
    <article
      className={`bg-white rounded-xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-shadow ${
        isTop1
          ? "border-2 border-brand-yellow shadow-lg ring-2 ring-brand-yellow/30 md:scale-[1.01]"
          : "border border-border"
      }`}
    >
      {/* Top row: badge + name + score */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isTop1
                ? "bg-brand-success text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Top {company.rank}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-brand-blue" fill="hsl(var(--brand-blue))" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-brand-blue">
              {company.name}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Nota Geral
          </div>
          <div className="text-4xl md:text-5xl font-extrabold text-brand-blue leading-none">
            {company.score.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-muted/40 rounded-xl p-3 border border-border/60"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <m.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight">
                {m.label}
              </span>
            </div>
            <div className="text-lg font-bold text-brand-blue">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tag cashback (apenas parceiras) */}
      {company.partner && (
        <div className="inline-flex items-center gap-1.5 bg-brand-yellow/20 text-brand-blue px-3 py-1 rounded-full text-xs font-bold mb-4">
          ⚡ 10% de cashback na adesão
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          className={`flex-1 rounded-xl font-bold ${
            isTop1
              ? "bg-brand-success text-white hover:bg-brand-success/90"
              : "bg-brand-blue text-white hover:bg-brand-blue/90"
          }`}
        >
          Ver plano e Aderir
        </Button>
        <Button
          variant="outline"
          className="flex-1 sm:flex-initial rounded-xl font-semibold border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
        >
          Saiba mais
        </Button>
      </div>
    </article>
  );
};

export default CompanyCard;
