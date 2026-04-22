import { useMemo, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
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
  { label: "Até 1 MWh/mês", desc: "Residencial pequeno" },
  { label: "1 a 3 MWh/mês", desc: "Residencial médio / comércio" },
  { label: "3 a 5 MWh/mês", desc: "Comércio médio" },
  { label: "Acima de 5 MWh/mês", desc: "Comércio / indústria" },
];

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-brand-blue">
            <Zap className="h-6 w-6 text-brand-yellow" fill="currentColor" />
            Simule sua economia — {companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Faixas com desconto da empresa */}
          <div className="rounded-xl border border-border overflow-hidden">
            {faixas.map((f, i) => (
              <div
                key={f.label}
                className={`flex items-center justify-between px-4 py-2.5 ${
                  i < faixas.length - 1 ? "border-b border-border" : ""
                } bg-muted/30`}
              >
                <div>
                  <div className="text-sm font-semibold text-brand-blue">
                    {f.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {f.desc}
                  </div>
                </div>
                <div className="text-base font-extrabold text-brand-success">
                  {discountPercent}% OFF
                </div>
              </div>
            ))}
          </div>

          {/* Input valor */}
          <div>
            <label className="block text-xs font-bold text-brand-blue mb-1.5">
              Qual o valor médio da sua conta de luz?
            </label>
            <Input
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={formatMoneyInput(valor)}
              onChange={(e) => setValor(parseMoneyInput(e.target.value))}
              className="rounded-xl h-12 text-lg font-bold text-brand-blue"
            />
          </div>

          {/* Resultados */}
          {valor > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Sua conta atual
                </div>
                <div className="text-base font-extrabold text-brand-blue mt-1">
                  {formatBRL(valor)}
                </div>
              </div>
              <div className="bg-brand-blue/5 rounded-xl p-3 text-center">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Nova conta estimada
                </div>
                <div className="text-base font-extrabold text-brand-blue mt-1">
                  {formatBRL(economia.novaConta)}
                </div>
              </div>
              <div className="bg-brand-success/10 rounded-xl p-3 text-center">
                <div className="text-[10px] text-brand-success font-semibold uppercase">
                  Sua economia
                </div>
                <div className="text-lg font-extrabold text-brand-success mt-1 leading-tight">
                  {formatBRL(economia.anual)}/ano
                </div>
                <div className="text-[11px] text-brand-success font-semibold">
                  {formatBRL(economia.mensal)}/mês
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            * O desconto incide sobre a Tarifa de Energia (TE) da sua conta, não
            sobre o valor total. Impostos, taxas e outros encargos não entram no
            cálculo. Os valores são estimativas baseadas em Bandeira Verde.
          </p>

          {/* CTA */}
          <Button
            onClick={handleAderir}
            className="w-full h-12 rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
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
