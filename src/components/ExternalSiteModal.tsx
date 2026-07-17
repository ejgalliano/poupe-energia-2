import { useState } from "react";
import { useRateLimit } from "@/hooks/useRateLimit";
import { getSubmitErrorMessage } from "@/lib/submitError";
import { ExternalLink, X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  siteUrl?: string | null;
  empresaId?: string;
  estadoSigla?: string;
  distribuidoraId?: string;
}

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const ExternalSiteModal = ({
  open, onOpenChange,
  companyName, siteUrl,
  empresaId, estadoSigla, distribuidoraId,
}: Props) => {
  const [view, setView] = useState<"main" | "form" | "success" | "error">("main");
  const [loading, setLoading] = useState(false);
  const { blocked, secondsLeft, markSubmitted } = useRateLimit("solicitacao-parceria", 600);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState(estadoSigla ?? "");

  const handleClose = (v: boolean) => {
    if (!v) {
      setView("main");
      setNome(""); setEmail(""); setTelefone(""); setCidade("");
      setEstado(estadoSigla ?? "");
    }
    onOpenChange(v);
  };

  const handleSolicitar = async () => {
    if (blocked) { toast.error(`Aguarde ${secondsLeft}s antes de enviar novamente.`); return; }
    setLoading(true);
    const { error } = await supabase.from("solicitacoes_parceria").insert({
      empresa_id: empresaId ?? null,
      empresa_nome: companyName,
      estado_sigla: estado || estadoSigla || null,
      distribuidora_id: distribuidoraId ?? null,
      nome_usuario: nome.trim() || null,
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      cidade: cidade.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error(getSubmitErrorMessage(error, "Não conseguimos registrar seu interesse."));
    } else {
      markSubmitted();
    }
    setView(error ? "error" : "success");
  };

  const handleGoToSite = () => {
    if (siteUrl) window.open(siteUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
    setView("main");
  };

  const canSubmit = nome.trim() && email.trim();

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
                <span>Quando ela se tornar parceira, <strong>te avisamos e você contrata com cashback</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Contratação direta sem cashback ou acompanhamento</span>
              </li>
            </ul>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={() => setView("form")}
                className="w-full bg-brand-success text-white hover:bg-brand-success/90 font-bold"
              >
                Quero ser avisado quando for parceira
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

        {view === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-brand-blue pr-6">
                Seus dados para contato
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground -mt-1">
              Assim podemos te avisar quando a <strong>{companyName}</strong> virar parceira.
            </p>

            <div className="space-y-3 mt-1">
              <div className="space-y-1">
                <Label htmlFor="sp-nome" className="text-xs font-semibold">Nome *</Label>
                <Input
                  id="sp-nome"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sp-email" className="text-xs font-semibold">Email *</Label>
                <Input
                  id="sp-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sp-tel" className="text-xs font-semibold">Telefone / WhatsApp</Label>
                <Input
                  id="sp-tel"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="sp-cidade" className="text-xs font-semibold">Cidade</Label>
                  <Input
                    id="sp-cidade"
                    placeholder="Sua cidade"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sp-estado" className="text-xs font-semibold">Estado</Label>
                  <select
                    id="sp-estado"
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">—</option>
                    {ESTADOS_BR.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleSolicitar}
                disabled={loading || !canSubmit}
                className="w-full bg-brand-success text-white hover:bg-brand-success/90 font-bold"
              >
                {loading ? "Registrando..." : "Confirmar interesse"}
              </Button>
              <button
                onClick={() => setView("main")}
                className="text-sm text-muted-foreground hover:text-foreground text-center"
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
              Vamos entrar em contato com a <strong>{companyName}</strong> e te avisamos
              assim que ela virar parceira. Obrigado!
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
