import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { registerLead, getRedirectUrl } from "@/lib/leadTracking";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  empresaNome: string;
  distribuidoraId?: string | null;
  estadoSigla?: string | null;
}

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z.string().trim().min(8, "Telefone inválido").max(30),
});

const maskPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const openInNewTab = (url: string) => {
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
};

const LeadCaptureDialog = ({
  open,
  onOpenChange,
  empresaId,
  empresaNome,
  distribuidoraId,
  estadoSigla,
}: Props) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setAccept(true);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const redirect = async (withData: boolean) => {
    if (!empresaId || loading) return;

    if (withData) {
      const parsed = schema.safeParse({ nome, email, telefone });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
        return;
      }
      if (!accept) {
        toast.error("Aceite a Política de Privacidade para continuar.");
        return;
      }
    }

    setLoading(true);
    try {
      // Busca URL antes para mostrar feedback se não houver
      const url = await getRedirectUrl(empresaId);
      if (!url) {
        toast.error("Link da empresa indisponível no momento.");
        setLoading(false);
        return;
      }

      // Registra lead em paralelo com o redirect (fire-and-forget)
      registerLead({
        empresaId,
        distribuidoraId,
        estadoSigla,
        evento: "clique_aderir",
        nome: withData ? nome.trim() : null,
        email: withData ? email.trim() : null,
        telefone: withData ? telefone.trim() : null,
      });

      handleClose(false);
      openInNewTab(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-brand-blue">
            Você está sendo direcionado para {empresaNome}
          </DialogTitle>
          <DialogDescription>
            Deixe seus dados para receber suporte e acompanhar sua adesão:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-bold text-brand-blue">
              Nome completo *
            </label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              maxLength={120}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-blue">Email *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              maxLength={255}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-blue">
              Telefone / WhatsApp *
            </label>
            <Input
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="rounded-xl"
            />
          </div>
          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <Checkbox
              checked={accept}
              onCheckedChange={(v) => setAccept(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-snug">
              Concordo com a{" "}
              <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline">
                Política de Privacidade
              </a>{" "}
              e com os{" "}
              <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline">
                Termos de Uso
              </a>{" "}
              e autorizo o uso dos meus dados.
            </span>
          </label>

          <Button
            onClick={() => redirect(true)}
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold bg-brand-success text-white hover:bg-brand-success/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Continuar com sua adesão
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
