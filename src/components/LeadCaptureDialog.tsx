import { useEffect, useState } from "react";
import { X, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { registerLead, getRedirectUrl } from "@/lib/leadTracking";
import { supabase } from "@/integrations/supabase/client";

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

type EmbValidation =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "valid"; id: string; nome: string; comissao: number }
  | { state: "invalid" };

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
  const [embValidation, setEmbValidation] = useState<EmbValidation>({ state: "idle" });
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);

  // Pré-preenche código a partir de sessionStorage / URL
  useEffect(() => {
    if (!open) return;
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get("emb");
      const fromStorage = sessionStorage.getItem("emb_codigo");
      const code = (fromUrl || fromStorage || "").trim();
      if (code && !codigoEmbaixador) {
        setCodigoEmbaixador(code);
        if (fromUrl) sessionStorage.setItem("emb_codigo", code);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Validação debounced do código
  useEffect(() => {
    const code = codigoEmbaixador.trim();
    if (!code) {
      setEmbValidation({ state: "idle" });
      return;
    }
    setEmbValidation({ state: "loading" });
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("embaixadores")
        .select("id, nome, comissao_percentual, ativo")
        .ilike("codigo", code)
        .maybeSingle();
      if (data && (data as any).ativo !== false) {
        setEmbValidation({
          state: "valid",
          id: (data as any).id,
          nome: (data as any).nome,
          comissao: Number((data as any).comissao_percentual ?? 0),
        });
      } else {
        setEmbValidation({ state: "invalid" });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [codigoEmbaixador]);

  const reset = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setCodigoEmbaixador("");
    setEmbValidation({ state: "idle" });
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

      const leadId = await registerLead({
        empresaId,
        distribuidoraId,
        estadoSigla,
        evento: "clique_aderir",
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });

      // Vínculo embaixador
      if (leadId && embValidation.state === "valid") {
        await supabase.from("leads_embaixadores").insert({
          lead_id: leadId,
          embaixador_id: embValidation.id,
          empresa_id: empresaId,
          status_comissao: "pendente",
          valor_comissao: 0,
        } as any);
      }

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
          <DialogPrimitive.Close
            className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-brand-blue" />
          </DialogPrimitive.Close>

          <div className="pt-6">
            <DialogPrimitive.Title className="text-2xl font-extrabold text-brand-blue leading-tight">
              Finalizar adesão
            </DialogPrimitive.Title>
            <p className="text-base text-brand-blue mt-0.5">{empresaNome}</p>
          </div>

          {/* Bloco do Embaixador */}
          <hr className="border-gray-200 my-2" />
          {(embValidation.state === "valid" || embaixador) ? (
            <div className="py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    {embValidation.state === "valid" ? embValidation.nome : embaixador?.nome}
                  </p>
                  <p className="text-xs text-gray-500">Embaixador Poupe Energia</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">(Só aparece se já existir vínculo)</p>
            </div>
          ) : (
            <div className="py-2 h-16 flex items-center">
              <p className="text-xs text-gray-300 italic">Nenhum embaixador vinculado</p>
            </div>
          )}
          <hr className="border-gray-200 my-2" />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-brand-blue">
                Nome completo <span style={{ color: "#F59E0B" }}>*</span>
              </label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} className="rounded-md mt-1 bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-blue">
                Email <span style={{ color: "#F59E0B" }}>*</span>
              </label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="rounded-md mt-1 bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-blue">
                WhatsApp <span style={{ color: "#F59E0B" }}>*</span>
              </label>
              <Input inputMode="tel" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} className="rounded-md mt-1 bg-white" />
            </div>
            <div>
              <label className="text-sm text-brand-blue">
                Código do embaixador (opcional)
              </label>
              <Input
                value={codigoEmbaixador}
                onChange={(e) => setCodigoEmbaixador(e.target.value)}
                maxLength={30}
                className="h-9 w-24 rounded-md mt-1 text-xs bg-white"
              />
              {embValidation.state === "loading" && (
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Validando...
                </p>
              )}
              {embValidation.state === "valid" && (
                <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> {embValidation.nome}
                </p>
              )}
              {embValidation.state === "invalid" && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <XCircle className="h-3 w-3" /> Código não encontrado
                </p>
              )}
              {embValidation.state === "idle" && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  (campo pequeno, sem destaque visual)
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border my-4" />

          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <Checkbox checked={accept} onCheckedChange={(v) => setAccept(v === true)} />
            <span className="text-sm text-foreground">Concordo com os termos</span>
          </label>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-md font-bold uppercase tracking-wide text-white"
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
