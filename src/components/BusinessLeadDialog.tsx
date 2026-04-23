import { useState } from "react";
import { z } from "zod";
import { Upload, X, FileText, CheckCircle2, ArrowRight, Paperclip, ClipboardList, Trophy, Wallet } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const schema = z.object({
  razao_social: z.string().trim().min(2, "Informe a razão social").max(200),
  responsavel_nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
});

const MAX_FILE_MB = 10;

const BusinessLeadDialog = ({ open, onOpenChange }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    razao_social: "",
    responsavel_nome: "",
    email: "",
    telefone: "",
  });
  const [accepted, setAccepted] = useState(true);

  const reset = () => {
    setForm({
      razao_social: "",
      responsavel_nome: "",
      email: "",
      telefone: "",
    });
    setFiles([]);
    setAccepted(true);
    setSuccess(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      onOpenChange(false);
      setTimeout(reset, 300);
    } else {
      onOpenChange(v);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    const valid = list.filter((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} excede ${MAX_FILE_MB}MB`);
        return false;
      }
      const ok = /pdf|image\//.test(f.type);
      if (!ok) toast.error(`${f.name}: apenas PDF ou imagem`);
      return ok;
    });
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!accepted) {
      toast.error("Aceite a política de privacidade");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Verifique os campos");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Upload arquivos
      const uploadedPaths: string[] = [];
      const folder = `${Date.now()}-${parsed.data.razao_social
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}`;
      for (const f of files) {
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${folder}/${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("contas-empresariais")
          .upload(path, f, { upsert: false, contentType: f.type });
        if (upErr) {
          console.error(upErr);
          toast.error(`Falha ao enviar ${f.name}`);
        } else {
          uploadedPaths.push(path);
        }
      }

      // 2) Inserir lead
      const { error } = await supabase.from("leads_empresariais").insert({
        razao_social: parsed.data.razao_social,
        cnpj: "",
        estado_sigla: null,
        distribuidora_id: null,
        distribuidora_nome: null,
        valor_conta: null,
        responsavel_nome: parsed.data.responsavel_nome,
        email: parsed.data.email,
        telefone: parsed.data.telefone,
        arquivos_paths: uploadedPaths,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Erro ao enviar solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4">
        {success ? (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-brand-success" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-blue">
              Recebemos sua solicitação!
            </h2>
            <p className="text-muted-foreground">
              Nossa equipe entrará em contato em até 24 horas.
            </p>
            <Button
              onClick={() => handleClose(false)}
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-brand-blue">
                Comparar Propostas para minha Empresa
              </DialogTitle>
            </DialogHeader>

            {/* Stepper explicativo detalhado e compacto */}
            <div className="bg-[#F9FAFB] rounded-xl py-2 px-3 border border-border">
              <ol className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-1 relative">
                {[
                  {
                    icon: Paperclip,
                    title: "Anexe suas faturas",
                    desc: "Envie uma ou mais contas de luz. Extraímos os dados automaticamente.",
                  },
                  {
                    icon: ClipboardList,
                    title: "Preencha seus dados",
                    desc: "Só precisamos do seu nome, email e telefone para retorno.",
                  },
                  {
                    icon: Trophy,
                    title: "Mesa competitiva",
                    desc: "Consultamos as principais comercializadoras e negociamos para você.",
                  },
                  {
                    icon: Wallet,
                    title: "Receba as propostas",
                    desc: "Você recebe as melhores opções com economia e segurança jurídica.",
                  },
                ].map((step, i, arr) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={i}
                      className="relative flex flex-col items-center text-center px-1"
                    >
                      {i < arr.length - 1 && (
                        <span
                          aria-hidden
                          className="hidden md:block absolute top-8 left-[calc(50%+1rem)] right-[calc(-50%+1rem)] h-0.5 bg-border"
                        />
                      )}
                      <Icon className="h-5 w-5 text-brand-blue mb-1" />
                      <div className="relative z-10 h-6 w-6 rounded-full bg-brand-yellow text-brand-blue text-[11px] font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </div>
                      <div className="mt-1 text-xs font-bold text-brand-blue leading-tight">
                        {step.title}
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500 leading-snug">
                        {step.desc}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="border-t border-border" />

            <div className="space-y-3 pt-1">
              {/* Upload */}
              <div>
                <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-brand-blue/50 hover:bg-muted/30 transition-colors text-center">
                  <Upload className="h-5 w-5 text-brand-blue" />
                  <span className="text-xs text-muted-foreground">
                    Clique para anexar suas contas de luz (PDF ou imagem) — múltiplos arquivos
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Limite de 10MB por arquivo
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-xs bg-muted/40 rounded-md px-2 py-1"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{f.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remover ${f.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1">
                  Razão Social / Nome da empresa *
                </label>
                <Input
                  value={form.razao_social}
                  onChange={(e) =>
                    setForm({ ...form, razao_social: e.target.value })
                  }
                  maxLength={200}
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-brand-blue mb-1">
                    Responsável *
                  </label>
                  <Input
                    value={form.responsavel_nome}
                    onChange={(e) =>
                      setForm({ ...form, responsavel_nome: e.target.value })
                    }
                    maxLength={120}
                    className="h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-blue mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    className="h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1">
                  Telefone *
                </label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: maskPhone(e.target.value) })
                  }
                  className="h-9"
                />
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer pt-2">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(c) => setAccepted(Boolean(c))}
                  className="mt-0.5"
                />
                <span className="text-muted-foreground">
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
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold"
              >
                {submitting ? "Enviando..." : "Receber propostas"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessLeadDialog;
