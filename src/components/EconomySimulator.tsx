import { useMemo, useState } from "react";
import { Zap, ArrowRight, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  /** Desconto em % (ex: 15) */
  discountPercent: number;
  empresaId?: string;
  distribuidoraId?: string | null;
  estadoSigla?: string | null;
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

const faixas = [
  { label: "< 1 MWh", range: "Até 1 MWh", color: "text-foreground" },
  { label: "1-3 MWh", range: "1 a 3 MWh", color: "text-brand-yellow" },
  { label: "3-5 MWh", range: "3 a 5 MWh", color: "text-brand-yellow" },
  { label: "> 5 MWh", range: "Acima de 5 MWh", color: "text-brand-success" },
];

const detectFaixa = (valor: number) => {
  // valor estimado em R$/mês -> usar tarifa média ~1000/MWh para detecção rough
  // Mas como é genérico, vamos usar faixas por valor conta:
  if (valor < 1000) return faixas[0];
  if (valor < 3000) return faixas[1];
  if (valor < 5000) return faixas[2];
  return faixas[3];
};

const EconomySimulator = ({
  open,
  onOpenChange,
  companyName,
  discountPercent,
  empresaId,
  distribuidoraId,
  estadoSigla,
}: Props) => {
  const [valor, setValor] = useState(0);
  const [captureOpen, setCaptureOpen] = useState(false);

  const handleAderir = () => {
    if (!empresaId) return;
    setCaptureOpen(true);
  };

  const economia = useMemo(() => {
    const mensal = valor * (discountPercent / 100);
    return {
      mensal,
      anual: mensal * 12,
      novaConta: Math.max(valor - mensal, 0),
    };
  }, [valor, discountPercent]);

  const faixaDetectada = valor > 0 ? detectFaixa(valor) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-3 md:p-6 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-success/15 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-brand-success" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base md:text-xl font-bold text-foreground leading-tight">
                Simule sua economia
              </DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{companyName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 pt-1">
          {/* Faixas de desconto */}
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Descontos por faixa de consumo
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {faixas.map((f) => (
                <div
                  key={f.label}
                  className="bg-background rounded-lg px-2 py-2 text-center shadow-sm"
                >
                  <div className="text-[11px] md:text-xs text-muted-foreground">{f.label}</div>
                  <div className={`text-sm md:text-base font-bold ${f.color}`}>
                    {discountPercent}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input valor */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              💡 Qual é o valor da sua conta de luz?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-lg font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                inputMode="numeric"
                placeholder="0,00"
                value={formatMoneyInput(valor).replace("R$", "").trim()}
                onChange={(e) => setValor(parseMoneyInput(e.target.value))}
                className="rounded-xl h-11 md:h-12 pl-12 pr-3 text-base md:text-lg font-bold text-foreground focus-visible:ring-brand-blue focus-visible:border-brand-blue"
              />
            </div>
            {faixaDetectada && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-brand-blue" />
                Faixa detectada:{" "}
                <span className="text-brand-blue font-semibold">{faixaDetectada.range}</span>
                {" "}— desconto de{" "}
                <span className="text-brand-success font-semibold">{discountPercent}%</span>
              </p>
            )}
          </div>

          {/* Resultados */}
          {valor > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-[11px] md:text-xs text-muted-foreground">
                    Sua conta atual
                  </div>
                  <div className="text-base md:text-lg font-extrabold text-foreground mt-0.5">
                    {formatBRL(valor)}
                  </div>
                </div>
                <div className="bg-brand-success/10 rounded-xl p-3 text-center">
                  <div className="text-[11px] md:text-xs text-brand-success">
                    Nova conta estimada
                  </div>
                  <div className="text-base md:text-lg font-extrabold text-brand-success mt-0.5">
                    {formatBRL(economia.novaConta)}
                  </div>
                </div>
              </div>

              <div className="bg-brand-success rounded-2xl p-4 text-center text-white">
                <div className="text-sm md:text-base font-semibold">Sua economia estimada</div>
                <div className="text-2xl md:text-3xl font-extrabold mt-1 leading-tight">
                  {formatBRL(economia.anual)}
                  <span className="text-base md:text-lg font-bold">/ano</span>
                </div>
                <div className="text-xs md:text-sm opacity-90 mt-0.5">
                  {formatBRL(economia.mensal)} por mês
                </div>
              </div>
            </>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-snug">
            * O desconto vale sobre a parte de energia da conta. Impostos e taxas não entram no
            cálculo, por isso o valor pode variar.
          </p>

          {/* CTA */}
          <Button
            onClick={handleAderir}
            className="w-full py-3 h-auto rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
            disabled={valor === 0 || !empresaId}
          >
            Ver plano e Aderir
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {empresaId && (
          <LeadCaptureDialog
            open={captureOpen}
            onOpenChange={setCaptureOpen}
            empresaId={empresaId}
            empresaNome={companyName}
            distribuidoraId={distribuidoraId}
            estadoSigla={estadoSigla}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EconomySimulator;
