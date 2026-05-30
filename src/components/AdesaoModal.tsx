import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  User, Mail, Phone, CreditCard, Building2, Gift,
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Distribuidora { id: string; nome: string; }
interface Empresa { id: string; nome: string; }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId?: string;
  empresaNome?: string;
  distribuidoraId?: string;
  distribuidoraNome?: string;
}

// ── File upload field ────────────────────────────────────────────────────────
function FileUploadField({
  label, sublabel, accept, file, onChange, error,
}: {
  label: string; sublabel?: string; accept: string;
  file: File | null; onChange: (f: File | null) => void; error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-3 py-2.5 transition text-left ${
          error ? "border-red-400 bg-red-50"
          : file ? "border-brand-blue/50 bg-brand-blue/5"
          : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
        }`}
      >
        {error ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          : file ? <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
          : <Upload className="h-4 w-4 text-brand-blue shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${error ? "text-red-600" : file ? "text-brand-blue" : "text-gray-600"}`}>
            {error ?? (file ? file.name : label)}
          </p>
          {sublabel && !file && <p className="text-[10px] text-gray-400">{sublabel}</p>}
          {file && <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>}
        </div>
        {preview && <img src={preview} alt="" className="h-8 w-8 rounded object-cover shrink-0 border border-gray-200" />}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {required && <span className="text-brand-blue mr-0.5">*</span>}{label}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";
const SELECT = "w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white appearance-none";
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export default function AdesaoModal({ open, onOpenChange, empresaId, empresaNome, distribuidoraId, distribuidoraNome }: Props) {
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    nome: "", cpf_cnpj: "", email: "", telefone: "",
    distribuidora_id: distribuidoraId ?? "",
    distribuidora_nome: distribuidoraNome ?? "",
    empresa_id: empresaId ?? "",
    empresa_nome: empresaNome ?? "",
    codigo_embaixador: "",
    aceite_termos: false,
  });

  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);
  const [fatura, setFatura] = useState<File | null>(null);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      distribuidora_id: distribuidoraId ?? "",
      distribuidora_nome: distribuidoraNome ?? "",
      empresa_id: empresaId ?? "",
      empresa_nome: empresaNome ?? "",
    }));
  }, [empresaId, empresaNome, distribuidoraId, distribuidoraNome]);

  useEffect(() => {
    if (!open) return;
    supabase.from("distribuidoras").select("id, nome").order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setDone(false);
      setDocFrente(null); setDocVerso(null); setFatura(null);
      setForm((f) => ({ ...f, nome: "", cpf_cnpj: "", email: "", telefone: "", codigo_embaixador: "", aceite_termos: false }));
    }
  }, [open]);

  const set = (field: string) => (value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleDistrib = (id: string) => {
    const d = distribuidoras.find((x) => x.id === id);
    setForm((f) => ({ ...f, distribuidora_id: id, distribuidora_nome: d?.nome ?? "" }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("documentos-adesao").upload(path, file, { upsert: true, contentType: file.type });
    return error ? null : data.path;
  };

  const canSubmit = form.nome && form.cpf_cnpj && form.email && form.telefone &&
    form.distribuidora_id && docFrente && docVerso && fatura && form.aceite_termos;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const ts = Date.now();
      const folder = `${ts}_${form.cpf_cnpj.replace(/\D/g, "").slice(0, 11)}`;
      const [frente, verso, fat] = await Promise.all([
        uploadFile(docFrente!, `${folder}/doc_frente.${docFrente!.name.split(".").pop()}`),
        uploadFile(docVerso!, `${folder}/doc_verso.${docVerso!.name.split(".").pop()}`),
        uploadFile(fatura!, `${folder}/fatura.${fatura!.name.split(".").pop()}`),
      ]);
      if (!frente || !verso || !fat) { toast.error("Erro ao enviar arquivos."); setSubmitting(false); return; }

      const { error } = await supabase.from("cashback_cadastros").insert({
        nome: form.nome, cpf_cnpj: form.cpf_cnpj, email: form.email,
        telefone: form.telefone, whatsapp: form.telefone,
        distribuidora_id: form.distribuidora_id || null,
        distribuidora_nome: form.distribuidora_nome || null,
        empresa_id: form.empresa_id || null,
        empresa_nome: form.empresa_nome || null,
        codigo_embaixador: form.codigo_embaixador || null,
        doc_frente_url: frente, doc_verso_url: verso, fatura_url: fat,
        aceite_termos: form.aceite_termos,
        ciente_parcela_unica: true, autoriza_validacao: true, status: "pendente",
      });
      if (error) throw error;
      setDone(true);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-2xl border-0 sm:border">
        <DialogTitle className="sr-only">Formulário de Adesão</DialogTitle>

        {done ? (
          <div className="flex flex-col items-center justify-center text-center px-8 py-16">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-extrabold text-brand-blue mb-3">Cadastro Enviado!</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
              Seus dados e documentos foram recebidos. Nossa equipe entrará em contato em breve pelo telefone informado.
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="bg-brand-blue text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-brand-blue/90 transition"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-brand-blue px-5 sm:px-7 pt-5 pb-4 flex items-center justify-between gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-[11px] font-medium">Formulário de Adesão</p>
                  <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate">
                    {form.empresa_nome ? `Plano — ${form.empresa_nome}` : "Plano de Créditos de Energia"}
                  </h2>
                </div>
              </div>
              <button onClick={() => onOpenChange(false)} className="shrink-0 text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-7 py-5 space-y-6">

              {/* Dados pessoais */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-blue mb-3 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Dados do Solicitante
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nome completo (representante legal)" required>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="text" placeholder="Nome completo" value={form.nome}
                        onChange={(e) => set("nome")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                  <Field label="CPF ou CNPJ" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="text" placeholder="000.000.000-00" value={form.cpf_cnpj}
                        onChange={(e) => set("cpf_cnpj")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                  <Field label="E-mail" required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="email" placeholder="exemplo@email.com" value={form.email}
                        onChange={(e) => set("email")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                  <Field label="Telefone celular" required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="tel" placeholder="(00) 00000-0000" value={form.telefone}
                        onChange={(e) => set("telefone")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Distribuidora */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-blue mb-3 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Dados da Energia
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Distribuidora" required>
                    <div className="relative">
                      <select value={form.distribuidora_id} onChange={(e) => handleDistrib(e.target.value)} className={SELECT}>
                        <option value="">Selecione a distribuidora</option>
                        {distribuidoras.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                      </select>
                      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Field>
                  <Field label="Código do Embaixador (opcional)">
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="text" placeholder="Código do embaixador" value={form.codigo_embaixador}
                        onChange={(e) => set("codigo_embaixador")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-blue mb-3 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Documentos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-600 mb-2">Documento com foto (RG ou CNH)</p>
                    <div className="space-y-2">
                      <FileUploadField label="Frente do documento" sublabel="pdf ou imagem" accept={ACCEPT} file={docFrente} onChange={setDocFrente} />
                      <FileUploadField label="Verso do documento" sublabel="pdf ou imagem" accept={ACCEPT} file={docVerso} onChange={setDocVerso} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-600 mb-2">Fatura de Luz mais recente</p>
                    <FileUploadField label="Fatura de Luz" sublabel="pdf ou imagem" accept={ACCEPT} file={fatura} onChange={setFatura} />
                    <div className="mt-3 flex gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className="h-4 w-4 shrink-0 mt-0.5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <div>
                        <p className="text-[11px] font-semibold text-green-800">Dificuldade para anexar?</p>
                        <a href={`https://wa.me/5543996796546?text=${encodeURIComponent("Olá! Quero fazer adesão pelo portal Poupe Energia.")}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-green-700 underline font-medium">
                          Envie pelo WhatsApp →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aceite */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => set("aceite_termos")(!form.aceite_termos)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                    form.aceite_termos ? "bg-brand-blue border-brand-blue" : "border-gray-300 bg-white"
                  }`}>
                  {form.aceite_termos && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-600 leading-relaxed">
                  Li e aceito os{" "}
                  <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                    Termos e Condições
                  </Link>{" "}
                  e autorizo a validação dos meus dados junto à comercializadora parceira.
                </span>
              </label>

              {/* Submit */}
              <div className="pb-2">
                <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition ${
                    canSubmit && !submitting ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md" : "bg-gray-300 cursor-not-allowed"
                  }`}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar dados para gerar contrato
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  🔒 Dados protegidos com criptografia · LGPD
                </p>
              </div>

            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
