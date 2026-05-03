import { useState } from "react";
import { X, User } from "lucide-react";
import { z } from "zod";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { registerLead, getRedirectUrl } from "@/lib/leadTracking";

interface Embaixador {
  nome: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  empresaNome: string;
  distribuidoraId?: string | null;
  estadoSigla?: string | null;
  embaixador?: Embaixador | null;
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
  embaixador = null,
}: Props) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [codigoEmbaixador, setCodigoEmbaixador] = useState("");
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setCodigoEmbaixador("");
    setAccept(true);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!empresaId || loading) return;

    const parsed = schema.safeParse({ nome, email, telefone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    if (!accept) {
      toast.error("Aceite os termos para continuar.");
      return;
    }

    setLoading(true);
    try {
      const url = await getRedirectUrl(empresaId);
      if (!url) {
        toast.error("Link da empresa indisponível no momento.");
        setLoading(false);
        return;
      }

      registerLead({
        empresaId,
        distribuidoraId,
        estadoSigla,
        evento: "clique_aderir",
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });

      handleClose(false);
      openInNewTab(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%]",
            "bg-white rounded-2xl shadow-xl p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          {/* Close button top-left */}
          <DialogPrimitive.Close
            className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-brand-blue" />
          </DialogPrimitive.Close>

          {/* Title */}
          <div className="pt-6 text-center">
            <DialogPrimitive.Title className="text-2xl font-extrabold text-brand-blue leading-tight">
              Finalizar adesão
            </DialogPrimitive.Title>
            <p className="text-sm text-brand-blue mt-1">{empresaNome}</p>
          </div>

          <div className="border-t border-border my-4" />

          {/* Embaixador block */}
          {embaixador && (
            <>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-brand-blue">
                    {embaixador.nome}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Embaixador Poupe Energia
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                    (Só aparece se já existir vínculo)
                  </div>
                </div>
              </div>
              <div className="border-t border-border my-4" />
            </>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-brand-blue">
                Nome completo *
              </label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={120}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-blue">
                Email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-blue">
                WhatsApp *
              </label>
              <Input
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Código do embaixador (opcional)
              </label>
              <Input
                value={codigoEmbaixador}
                onChange={(e) => setCodigoEmbaixador(e.target.value)}
                maxLength={30}
                className="h-8 w-32 rounded-md mt-1 text-xs border-muted bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                (campo pequeno, sem destaque visual)
              </p>
            </div>
          </div>

          <div className="border-t border-border my-4" />

          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <Checkbox
              checked={accept}
              onCheckedChange={(v) => setAccept(v === true)}
            />
            <span className="text-sm text-foreground">
              Concordo com os termos
            </span>
          </label>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: "#F59E0B" }}
          >
            Finalizar adesão →
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default LeadCaptureDialog;
