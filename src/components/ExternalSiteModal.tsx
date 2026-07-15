import { useState } from "react";
import { ExternalLink, X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  siteUrl?: string | null;
  empresaId?: string;
  estadoSigla?: string;
  distribuidoraId?: string;
}

const ExternalSiteModal = ({
  open, onOpenChange,
  companyName, siteUrl,
  empresaId, estadoSigla, distribuidoraId,
}: Props) => {
  const [view, setView] = useState<"main" | "success" | "error">("main");
  const [loading, setLoading] = useState(false);

  const handleClose = (v: boolean) => {
    if (!v) setView("main");
    onOpenChange(v);
  };

  const handleSolicitar = async () => {
    setLoading(true);
    const { error } = await supabase.from("solicitacoes_parceria").insert({
      empresa_id: empresaId ?? null,
      empresa_nome: companyName,
      estado_sigla: estadoSigla ?? null,
      distribuidora_id: distribuidoraId ?? null,
    });
    setLoading(false);
    setView(error ? "error" : "success");
  };

  const handleGoToSite = () => {
    if (siteUrl) window.open(siteUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
    setView("main");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl">

        {view === "main" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-brand-blue pr-6">
                {companyName} ainda não é parceira da Poupe Energia
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Deseja que avisemos essa empresa que você gostaria de contratar
              através da nossa plataforma? Ao confirmar:
            </p>

            <ul className="mt-1 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0 mt-0.5" />
                <span>Registramos seu interesse e <strong>entramos em contato com a empresa</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0 mt-0.5" />
                <span>Quando ela se tornar parceira, você poderá <strong>contratar com cashback</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Contratação direta sem cashback ou acompanhamento</span>
              </li>
            </ul>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleSolicitar}
                disabled={loading}
                className="w-full bg-brand-success text-white hover:bg-brand-success/90 font-bold"
              >
                {loading ? "Registrando..." : "Quero ser avisado quando for parceira"}
              </Button>
              {siteUrl && (
                <Button
                  onClick={handleGoToSite}
                  variant="outline"
                  className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/10 font-semibold"
                >
                  Continuar para o site da empresa
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
              <button
                onClick={() => handleClose(false)}
                className="text-sm text-muted-foreground hover:text-foreground text-center mt-1"
              >
                Voltar
              </button>
            </div>
          </>
        )}

        {view === "error" && (
          <div className="text-center py-4 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-brand-blue">Ocorreu um erro</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Não conseguimos registrar seu interesse. Tente novamente mais tarde.
            </p>
            {siteUrl && (
              <Button onClick={handleGoToSite} variant="outline" size="sm" className="border-brand-blue text-brand-blue hover:bg-brand-blue/10">
                Ir para o site da empresa
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
            <Button onClick={() => handleClose(false)} className="w-full bg-brand-blue text-white hover:bg-brand-blue/90 font-bold mt-2">
              Fechar
            </Button>
          </div>
        )}

        {view === "success" && (
          <div className="text-center py-4 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-brand-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-brand-success" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-brand-blue">Interesse registrado!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vamos entrar em contato com a <strong>{companyName}</strong> e apresentar
              quantos consumidores querem contratar por aqui. Obrigado por ajudar a
              expandir o ecossistema Poupe Energia!
            </p>
            {siteUrl && (
              <Button
                onClick={handleGoToSite}
                variant="outline"
                size="sm"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue/10"
              >
                Ir para o site da empresa mesmo assim
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              onClick={() => handleClose(false)}
              className="w-full bg-brand-blue text-white hover:bg-brand-blue/90 font-bold mt-2"
            >
              Fechar
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default ExternalSiteModal;
