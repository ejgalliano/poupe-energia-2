import { useEffect, useMemo, useState } from "react";
import { Zap, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdesaoModal from "@/components/AdesaoModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  /** Desconto fallback quando faixas individuais não estão preenchidas */
  discountPercent: number;
  descontoAte1mwh?: number | null;
  desconto1a3mwh?: number | null;
  desconto3a5mwh?: number | null;
  descontoAcima5mwh?: number | null;
  empresaId?: string;
  distribuidoraId?: string | null;
  distribuidoraNome?: string | null;
  estadoSigla?: string | null;
  isPartner?: boolean;
  siteUrl?: string | null;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const parseMoneyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
};

const formatMoneyInput = (value: number) =>
  value === 0
    ? ""
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(value);

const FAIXAS = [
  { label: "< 1 MWh",  range: "Até 1 MWh" },
  { label: "1-3 MWh",  range: "1 a 3 MWh" },
  { label: "3-5 MWh",  range: "3 a 5 MWh" },
  { label: "> 5 MWh",  range: "Acima de 5 MWh" },
];

const EconomySimulator = ({
  open,
  onOpenChange,
  companyName,
  discountPercent,
  descontoAte1mwh,
  desconto1a3mwh,
  desconto3a5mwh,
  descontoAcima5mwh,
  empresaId,
  distribuidoraId,
  distribuidoraNome,
  estadoSigla,
  isPartner = false,
  siteUrl,
}: Props) => {
  const [valor, setValor] = useState(0);
  const [selectedFaixaIdx, setSelectedFaixaIdx] = useState(0);
  const [adesaoOpen, setAdesaoOpen] = useState(false);
  const [coeficiente, setCoeficiente] = useState(0.83);

  useEffect(() => {
    supabase
      .from("formula_config")
      .select("coeficiente_simulacao")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.coeficiente_simulacao) setCoeficiente(data.coeficiente_simulacao);
      });
  }, []);

  const descontosPorFaixa = [
    descontoAte1mwh   ?? discountPercent,
    desconto1a3mwh    ?? discountPercent,
    desconto3a5mwh    ?? discountPercent,
    descontoAcima5mwh ?? discountPercent,
  ];

  const descontoAtivo = descontosPorFaixa[selectedFaixaIdx];

  const economia = useMemo(() => {
    const base = valor * coeficiente;
    const mensal = base * (descontoAtivo / 100);
    return {
      mensal,
      anual: mensal * 12,
      novaConta: Math.max(valor - mensal, 0),
    };
  }, [valor, descontoAtivo, coeficiente]);

  const handleAderir = () => {
    if (!empresaId) return;
    setAdesaoOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
        {/* Cabeçalho */}
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="w-12 h-12 rounded-xl bg-brand-success/15 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-brand-success" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                Simule sua economia
              </DialogTitle>
              <p className="text-sm text-muted-foreground truncate">{companyName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Faixas de desconto — selecionáveis */}
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              1. Selecione sua faixa de consumo mensal
            </p>
            <div className="grid grid-cols-4 gap-2">
              {FAIXAS.map((f, i) => {
                const pct = descontosPorFaixa[i];
                const isSelected = selectedFaixaIdx === i;
                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setSelectedFaixaIdx(i)}
                    className={`rounded-lg px-1 py-2 text-center shadow-sm transition-all cursor-pointer border-2 ${
                      isSelected
                        ? "bg-brand-success/10 border-brand-success"
                        : "bg-background border-transparent hover:border-brand-success/40"
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{f.label}</div>
                    <div className={`text-sm sm:text-base font-bold ${isSelected ? "text-brand-success" : "text-foreground"}`}>
                      {pct != null ? `${pct}%` : "—"}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Faixa selecionada: <span className="font-semibold text-brand-blue">{FAIXAS[selectedFaixaIdx].range}</span> — desconto de <span className="font-semibold text-brand-success">{descontoAtivo}%</span>
            </p>
          </div>

          {/* Input valor */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-foreground mb-1.5">
              2. Qual é o valor da sua conta de luz?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base sm:text-lg font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                inputMode="numeric"
                placeholder="0,00"
                value={formatMoneyInput(valor).replace("R$", "").trim()}
                onChange={(e) => setValor(parseMoneyInput(e.target.value))}
                className="rounded-xl h-12 pl-12 pr-3 text-lg font-bold text-foreground focus-visible:ring-brand-blue focus-visible:border-brand-blue"
              />
            </div>
          </div>

          {/* Resultados */}
          {valor > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-xs sm:text-sm text-muted-foreground">Sua conta atual</div>
                  <div className="text-lg sm:text-xl font-extrabold text-foreground mt-0.5">
                    {formatBRL(valor)}
                  </div>
                </div>
                <div className="bg-brand-success/10 rounded-xl p-3 text-center">
                  <div className="text-xs sm:text-sm text-brand-success">Nova conta estimada</div>
                  <div className="text-lg sm:text-xl font-extrabold text-brand-success mt-0.5">
                    {formatBRL(economia.novaConta)}
                  </div>
                </div>
              </div>

              <div className="bg-brand-success rounded-2xl p-4 text-center text-white">
                <div className="text-sm sm:text-base font-semibold">Sua economia estimada</div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 leading-tight">
                  {formatBRL(economia.anual)}
                  <span className="text-base sm:text-lg font-bold">/ano</span>
                </div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">
                  {formatBRL(economia.mensal)} por mês
                </div>
              </div>
            </>
          )}

          {/* CTA */}
          {isPartner ? (
            <Button
              onClick={handleAderir}
              className="w-full py-3 h-auto rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
              disabled={valor === 0 || !empresaId}
            >
              Ver plano e Aderir
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : siteUrl ? (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full py-3 h-auto rounded-xl font-bold bg-brand-blue text-white hover:bg-brand-blue/90">
                Ir para o site
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          ) : null}
        </div>

        {empresaId && (
          <AdesaoModal
            open={adesaoOpen}
            onOpenChange={setAdesaoOpen}
            empresaId={empresaId}
            empresaNome={companyName}
            distribuidoraId={distribuidoraId ?? undefined}
            distribuidoraNome={distribuidoraNome ?? undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EconomySimulator;
