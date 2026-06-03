import { useState } from "react";
import { Zap, FileText } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import EconomySimulator from "@/components/EconomySimulator";
import AdesaoModal from "@/components/AdesaoModal";
import SupplierBadge, { TipoFornecedor } from "@/components/SupplierBadge";
import { registerLead } from "@/lib/leadTracking";

export interface Company {
  rank: number;
  name: string;
  discount: string;
  legalSecurity: string;
  reputation: string;
  minValue: string;
  score: number;
  partner?: boolean;
  cashbackPercentual?: number | null;
  estado?: string;
  distribuidora?: string;
  empresaId?: string;
  distribuidoraId?: string;
  tipoFornecedor?: TipoFornecedor | null;
  nivelRisco?: string | null;
  logoUrl?: string | null;
}

interface Props {
  company: Company;
  hideActions?: boolean;
}

const ordinal = (n: number) => `${n}º`;


const CompanyCard = ({ company, hideActions = false }: Props) => {
  const isBronze = company.tipoFornecedor === "intermediador";
  const isTop1 = company.rank === 1;
  const initial = company.name.trim().charAt(0).toUpperCase();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [simOpen, setSimOpen] = useState(false);
  const [adesaoOpen, setAdesaoOpen] = useState(false);
  const discountNumber = parseFloat(
    String(company.discount).replace("%", "").replace(",", ".")
  ) || 0;
  const detailHref = `/empresa/${slugify(company.name)}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const handleAderir = () => {
    if (!company.empresaId) { setSimOpen(true); return; }
    setAdesaoOpen(true);
  };

  const handleSaibaMais = (e: React.MouseEvent) => {
    e.preventDefault();
    if (company.empresaId) {
      registerLead({
        empresaId: company.empresaId,
        distribuidoraId: company.distribuidoraId,
        estadoSigla: company.estado,
        evento: "clique_saiba_mais",
      });
    }
    navigate(detailHref);
  };

  const metrics = [
    { label: "Desconto Inicial",          value: company.discount },
    { label: "Segurança Jurídica",        value: company.legalSecurity },
    { label: "Reputação Reclame Aqui",    value: company.reputation },
    { label: "Valor Mínimo para Adesão",  value: company.minValue },
  ];

  const scoreColor = isTop1 ? "text-brand-yellow" : "text-brand-blue";

  return (
    <article
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-visible ${
        isTop1 ? "border-2 border-brand-success" : "border border-border"
      }`}
    >
      {/* Badge rank */}
      {isTop1 ? (
        <div className="absolute -top-3 left-5 bg-brand-success text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
          Melhor empresa
        </div>
      ) : (
        <div className="absolute -top-3 left-5 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-border z-10">
          {ordinal(company.rank)}
        </div>
      )}

      {/* ── DESKTOP: layout horizontal (logo | métricas | nota) ── */}
      <div className="hidden md:flex items-center gap-0 pt-6">

        {/* Coluna esquerda: Logo inicial + nome + tags */}
        <div className="flex flex-col items-center justify-center gap-2 px-5 pb-4 shrink-0 w-36 self-stretch border-r border-border">
          <div className="h-16 w-16 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
            {company.logoUrl
              ? <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
              : <span className="text-2xl font-extrabold text-brand-blue">{initial}</span>
            }
          </div>
          <div className="text-center">
            <p className="text-sm font-extrabold text-brand-blue leading-tight">{company.name}</p>
            <div className="mt-1 flex flex-col items-center gap-1">
              <SupplierBadge tipo={company.tipoFornecedor} size="sm" compact />
            </div>
          </div>
          {!isBronze && (
            <Link
              to={detailHref}
              onClick={handleSaibaMais}
              className="inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap bg-muted text-muted-foreground px-2 py-0.5 rounded-md hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
            >
              <FileText className="h-3 w-3" />
              Ficha Técnica
            </Link>
          )}
        </div>

        {/* Centro: 4 métricas */}
        <div className="flex-1 grid grid-cols-4 self-stretch">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`flex flex-col items-center justify-center p-4 text-center ${
                i < metrics.length - 1 ? "border-r border-border" : ""
              }`}
            >
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight mb-1">
                {m.label}
              </div>
              <div className="text-lg font-extrabold text-brand-blue">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Coluna direita: Nota Final */}
        <div className="flex flex-col items-center justify-center px-6 shrink-0 w-32 self-stretch border-l border-border">
          <div className={`text-4xl font-extrabold leading-none ${scoreColor}`}>
            {company.score.toFixed(2).replace(".", ",")}
          </div>
          <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">
            Nota Final
          </div>
        </div>
      </div>

      {/* Tag cashback — desktop */}
      {company.partner && (
        <div className="hidden md:flex px-5 py-2 border-t border-border">
          <span className="inline-flex items-center gap-1.5 bg-brand-yellow/20 text-brand-blue px-3 py-1 rounded-full text-xs font-bold">
            ⚡ {company.cashbackPercentual ?? 10}% de cashback na adesão
          </span>
        </div>
      )}

      {/* CTAs — desktop */}
      {!hideActions && !isBronze && (
        <div className="hidden md:flex gap-2 px-5 py-4 border-t border-border">
          <Button
            onClick={() => setSimOpen(true)}
            variant="outline"
            className="flex-1 h-11 rounded-xl font-bold border-foreground/20"
          >
            <Zap className="h-4 w-4 mr-2" fill="currentColor" />
            Simular economia
          </Button>
          <Button
            onClick={handleAderir}
            className="flex-1 h-11 rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
          >
            Ver plano e Aderir
          </Button>
        </div>
      )}

      {/* ── MOBILE: layout vertical (mantém comportamento atual) ── */}
      <div className="md:hidden p-5 pt-6">

        {/* Linha 1: Logo + Nome + Nota */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
                : <span className="text-xl font-extrabold text-brand-blue">{initial}</span>
              }
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-brand-blue leading-tight">
                  {company.name}
                </h3>
                <SupplierBadge tipo={company.tipoFornecedor} size="sm" compact />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {!isBronze && (
                  <Link
                    to={detailHref}
                    onClick={handleSaibaMais}
                    className="inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap bg-muted text-muted-foreground px-2 py-0.5 rounded-md hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    Ficha Técnica
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-3xl font-extrabold leading-none ${scoreColor}`}>
              {company.score.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">
              Nota Final
            </div>
          </div>
        </div>

        {/* Linha 2: Métricas */}
        <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden mb-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`p-3 text-center ${i % 2 === 0 ? "border-r border-border" : ""} ${i < 2 ? "border-b border-border" : ""}`}
            >
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight mb-1">
                {m.label}
              </div>
              <div className="text-base font-extrabold text-brand-blue">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tag cashback */}
        {company.partner && (
          <div className="inline-flex items-center gap-1.5 bg-brand-yellow/20 text-brand-blue px-3 py-1 rounded-full text-xs font-bold mb-3">
            ⚡ {company.cashbackPercentual ?? 10}% de cashback na adesão
          </div>
        )}

        {/* CTAs */}
        {!hideActions && !isBronze && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setSimOpen(true)}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-foreground/20"
            >
              <Zap className="h-4 w-4 mr-2" fill="currentColor" />
              Simular economia
            </Button>
            <Button
              onClick={handleAderir}
              className="w-full h-12 rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
            >
              Ver plano e Aderir
            </Button>
          </div>
        )}
      </div>

      <EconomySimulator
        open={simOpen}
        onOpenChange={setSimOpen}
        companyName={company.name}
        discountPercent={discountNumber}
        empresaId={company.empresaId}
        distribuidoraId={company.distribuidoraId}
        distribuidoraNome={company.distribuidora}
        estadoSigla={company.estado}
      />

      {company.empresaId && (
        <AdesaoModal
          open={adesaoOpen}
          onOpenChange={setAdesaoOpen}
          empresaId={company.empresaId}
          empresaNome={company.name}
          distribuidoraId={company.distribuidoraId}
          distribuidoraNome={company.distribuidora}
        />
      )}
    </article>
  );
};

export default CompanyCard;
