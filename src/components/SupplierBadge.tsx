import { Star, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type TipoFornecedor = "fornecedor_direto" | "operador" | "intermediador";

interface TierInfo {
  label: string;
  shortLabel: string;
  filled: number;
  starColor: string;
  emptyColor: string;
  badgeBg: string;
  badgeText: string;
  tooltip: string;
  description: string;
  short: string;
}

export const SUPPLIER_TIERS: Record<TipoFornecedor, TierInfo> = {
  fornecedor_direto: {
    label: "Fornecedor Direto",
    shortLabel: "OURO",
    filled: 5,
    starColor: "text-amber-400 fill-amber-400",
    emptyColor: "text-amber-400/30",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500",
    badgeText: "text-amber-900",
    tooltip:
      "Fornecedor Direto — Produz a energia e controla a usina. Maior segurança jurídica e menor risco de falhas.",
    description:
      "Produz a energia e controla a usina. Maior segurança jurídica e menor risco de falhas.",
    short: "Produz a energia e controla a usina",
  },
  operador: {
    label: "Operador",
    shortLabel: "PRATA",
    filled: 4,
    starColor: "text-slate-400 fill-slate-400",
    emptyColor: "text-slate-400/30",
    badgeBg: "bg-gradient-to-r from-slate-300 to-slate-400",
    badgeText: "text-slate-800",
    tooltip:
      "Operador — Contrata energia e organiza a entrega. Boa estrutura operacional com dependência parcial de terceiros.",
    description:
      "Contrata energia e organiza a entrega. Boa estrutura operacional com dependência parcial de terceiros.",
    short: "Contrata energia e organiza a entrega",
  },
  intermediador: {
    label: "Intermediador",
    shortLabel: "BRONZE",
    filled: 3,
    starColor: "text-orange-600 fill-orange-600",
    emptyColor: "text-orange-600/30",
    badgeBg: "bg-gradient-to-r from-orange-500 to-amber-700",
    badgeText: "text-white",
    tooltip:
      "Intermediador — Só vende a energia, não produz nem controla. Maior dependência de terceiros.",
    description:
      "Só vende a energia, não produz nem controla. Maior dependência de terceiros.",
    short: "Só vende a energia",
  },
};

const StarRow = ({
  filled,
  size = 14,
  starColor,
  emptyColor,
}: {
  filled: number;
  size?: number;
  starColor: string;
  emptyColor: string;
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        style={{ width: size, height: size }}
        className={i < filled ? starColor : emptyColor}
      />
    ))}
  </div>
);

interface Props {
  tipo?: TipoFornecedor | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

const TiersLegend = () => (
  <div className="space-y-2.5 text-sm">
    <p className="font-semibold text-brand-blue mb-2">
      Modelo de Negócio
    </p>
    {(Object.keys(SUPPLIER_TIERS) as TipoFornecedor[]).map((k) => {
      const t = SUPPLIER_TIERS[k];
      return (
        <div key={k} className="flex items-start gap-2">
          <StarRow
            filled={t.filled}
            starColor={t.starColor}
            emptyColor={t.emptyColor}
            size={12}
          />
          <div className="text-xs">
            <span className="font-bold text-brand-blue">{t.label}</span>
            <span className="text-muted-foreground"> → {t.short}</span>
          </div>
        </div>
      );
    })}
  </div>
);

const SupplierBadge = ({
  tipo,
  size = "sm",
  showLabel = false,
  compact = false,
  className,
}: Props) => {
  const key: TipoFornecedor = (tipo ?? "intermediador") as TipoFornecedor;
  const tier = SUPPLIER_TIERS[key] ?? SUPPLIER_TIERS.intermediador;
  const starSize = size === "lg" ? 18 : size === "md" ? 16 : 13;
  const badgePadding =
    size === "lg" ? "px-2.5 py-0.5 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 cursor-help">
              <StarRow
                filled={tier.filled}
                starColor={tier.starColor}
                emptyColor={tier.emptyColor}
                size={starSize}
              />
              {!compact && (
                <span
                  className={cn(
                    "font-bold rounded-md tracking-wide",
                    tier.badgeBg,
                    tier.badgeText,
                    badgePadding,
                  )}
                >
                  {tier.shortLabel}
                </span>
              )}
              {showLabel && (
                <span className="text-sm font-semibold text-brand-blue">
                  {tier.label}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{tier.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="O que significam os selos?"
            className="inline-flex items-center justify-center text-muted-foreground hover:text-brand-blue transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <TiersLegend />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SupplierBadge;
