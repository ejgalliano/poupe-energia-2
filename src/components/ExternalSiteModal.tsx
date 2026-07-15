import { ExternalLink, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  siteUrl: string;
}

const ExternalSiteModal = ({ open, onOpenChange, companyName, siteUrl }: Props) => {
  const handleConfirm = () => {
    window.open(siteUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-brand-blue pr-6">
            {companyName} ainda não é parceira da Poupe Energia
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Você poderá continuar sua contratação diretamente com ela. Como a adesão
          ocorrerá fora da nossa plataforma:
        </p>

        <ul className="mt-1 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>Não haverá <strong>cashback</strong> pela Poupe Energia</span>
          </li>
          <li className="flex items-start gap-2">
            <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>Não poderemos <strong>acompanhar sua contratação</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>O suporte será realizado <strong>diretamente pela empresa</strong></span>
          </li>
        </ul>

        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={handleConfirm}
            variant="outline"
            className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/10 font-semibold"
          >
            Continuar para o site da empresa
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-brand-success text-white hover:bg-brand-success/90 font-bold"
          >
            Voltar e ver opções com cashback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalSiteModal;
