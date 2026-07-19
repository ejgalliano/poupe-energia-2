import { useEffect, useMemo, useState } from "react";
import { Zap, ArrowRight, ExternalLink, Gift } from "lucide-react";
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

interface Faixa {
  valor_min: number;
  valor_max: number | null;
  desconto_percentual: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  /** Desconto fallback quando a empresa ainda não tem política de faixas cadastrada para esta distribuidora */
  discountPercent: number;
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

const EconomySimulator = ({
  open,
  onOpenChange,
  companyName,
  discountPercent,
  empresaId,
  distribuidoraId,
  distribuidoraNome,
  estadoSigla,
  isPartner = false,
  siteUrl,
}: Props) => {
  const [valor, setValor] = useState(0);
  const [adesaoOpen, setAdesaoOpen] = useState(false);
  const [coeficiente, setCoeficiente] = useState(0.83);
  const [faixas, setFaixas] = useState<Faixa[] | null>(null);
  const [bonificacao, setBonificacao] = useState<string | null>(null);

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

  // Política de desconto por faixa de valor de fatura, para [Empresa + Distribuidora].
  // Se a empresa ainda não tiver política cadastrada, cai no discountPercent (fallback).
  useEffect(() => {
    if (!empresaId || !distribuidoraId) {
      setFaixas(null);
      setBonificacao(null);
      return;
    }
    (async () => {
      const { data: pol } = await supabase
        .from("politicas_desconto" as any)
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("distribuidora_id", distribuidoraId)
        .maybeSingle();
      if (!pol) {
        setFaixas(null);
        setBonificacao(null);
        return;
      }
      const polAny = pol as any;
      setBonificacao(polAny.bonificacao || null);
      const { data: faixasData } = await supabase
        .from("politicas_desconto_faixas" as any)
        .select("*")
        .eq("politica_id", polAny.id)
        .order("valor_min");
      setFaixas(
        ((faixasData ?? []) as any[]).map((f) => ({
          valor_min: Number(f.valor_min),
          valor_max: f.valor_max == null ? null : Number(f.valor_max),
          desconto_percentual: Number(f.desconto_percentual),
        }))
      );
    })();
  }, [empresaId, distribuidoraId]);

  // Acha a faixa cujo valor_min é o maior possível ainda <= valor digitado.
  // Isso cobre automaticamente o caso "acima da maior faixa": o desconto da
  // faixa mais alta continua sendo aplicado, sem precisar de caso especial.
  const descontoAtivo = useMemo(() => {
    if (faixas && faixas.length > 0) {
      const elegiveis = faixas.filter((f) => f.valor_min <= valor);
      if (elegiveis.length > 0) {
        return elegiveis.reduce((maior, f) => (f.valor_min > maior.valor_min ? f : maior)).desconto_percentual;
      }
    }
    return discountPercent;
  }, [faixas, valor, discountPercent]);

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
          {/* Input valor */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-foreground mb-1.5">
              Qual é o valor da sua conta de luz?
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
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-brand-success text-white font-extrabold text-lg sm:text-xl px-4 py-1.5 rounded-full shadow-sm">
                  <Zap className="h-5 w-5" fill="currentColor" />
                  {descontoAtivo}% de desconto
                </span>
              </div>

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

              {bonificacao && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <Gift className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Parabéns! Este plano inclui:</strong> {bonificacao}
                  </span>
                </div>
              )}
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
                Ver oferta no site oficial
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
