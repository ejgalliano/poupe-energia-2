import { useEffect, useRef, useState } from "react";
import { useRateLimit } from "@/hooks/useRateLimit";
import { getSubmitErrorMessage } from "@/lib/submitError";
import { Link } from "react-router-dom";
import {
  Zap, Calendar, User, Mail, Phone, CreditCard, Building2, Gift,
  FileText, Paperclip, CheckCircle2, AlertCircle, Loader2, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Distribuidora { id: string; nome: string; }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId?: string;
  empresaNome?: string;
  distribuidoraId?: string;
  distribuidoraNome?: string;
  cashbackPercentual?: number | null;
}

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

function WaIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={WA_PATH} />
    </svg>
  );
}

function FileUploadField({
  label, sublabel, accept, file, onChange, error,
}: {
  label: string; sublabel?: string; accept: string;
  file: File | null; onChange: (f: File | null) => void; error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-3 py-2.5 transition text-left ${
          error
            ? "border-red-400 bg-red-50"
            : file
            ? "border-brand-blue/50 bg-brand-blue/5"
            : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
        }`}
      >
        {error ? (
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
        ) : file ? (
          <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
        ) : (
          <Paperclip className="h-4 w-4 text-brand-blue shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${error ? "text-red-600" : file ? "text-brand-blue" : "text-gray-600"}`}>
            {error ?? (file ? file.name : label)}
          </p>
          {sublabel && !file && <p className="text-[10px] text-gray-400">{sublabel}</p>}
          {file && <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {required && <span className="text-brand-blue mr-0.5">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

function maskCpfCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const MONTHS = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];
const _now = new Date();
const TODAY_STR = `${_now.getDate()} de ${MONTHS[_now.getMonth()]} de ${_now.getFullYear()}`;

export default function AdesaoModal({
  open, onOpenChange, empresaId, empresaNome, distribuidoraId, distribuidoraNome, cashbackPercentual,
}: Props) {
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { blocked, secondsLeft, markSubmitted } = useRateLimit("adesao-modal", 1800);

  const [form, setForm] = useState({
    nome: "", cpf_cnpj: "", email: "", telefone: "",
    distribuidora_id: distribuidoraId ?? "",
    distribuidora_nome: distribuidoraNome ?? "",
    empresa_id: empresaId ?? "",
    empresa_nome: empresaNome ?? "",
    codigo_embaixador: "",
    aceite_termos: true,
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
    supabase
      .from("distribuidoras")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setDocFrente(null);
      setDocVerso(null);
      setFatura(null);
      setForm((f) => ({
        ...f,
        nome: "", cpf_cnpj: "", email: "", telefone: "",
        codigo_embaixador: "", aceite_termos: true,
      }));
    }
  }, [open]);

  const set = (field: string) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleDistrib = (id: string) => {
    const d = distribuidoras.find((x) => x.id === id);
    setForm((f) => ({ ...f, distribuidora_id: id, distribuidora_nome: d?.nome ?? "" }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("documentos-adesao")
      .upload(path, file, { upsert: true, contentType: file.type });
    return error ? null : data.path;
  };

  const canSubmit =
    form.nome && form.cpf_cnpj && form.email && form.telefone &&
    form.distribuidora_id && docFrente && docVerso && fatura && form.aceite_termos;

  const handleSubmit = async () => {
    if (blocked) { toast.error(`Aguarde ${secondsLeft}s antes de enviar novamente.`); return; }
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
      if (!frente || !verso || !fat) {
        toast.error("Erro ao enviar arquivos.");
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.from("cashback_cadastros").insert({
        nome: form.nome, cpf_cnpj: form.cpf_cnpj, email: form.email,
        telefone: form.telefone, whatsapp: form.telefone,
        distribuidora_id: form.distribuidora_id || null,
        distribuidora_nome: form.distribuidora_nome || null,
        empresa_id: form.empresa_id || null,
        empresa_nome: form.empresa_nome || null,
        cashback_percentual: cashbackPercentual ?? null,
        codigo_embaixador: form.codigo_embaixador || null,
        doc_frente_url: frente, doc_verso_url: verso, fatura_url: fat,
        aceite_termos: form.aceite_termos,
        ciente_parcela_unica: true, autoriza_validacao: true, status: "pendente",
      });
      if (error) throw error;
      markSubmitted();
      setDone(true);
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Erro ao enviar cadastro. Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-2xl border-0 sm:border">
        <DialogTitle className="sr-only">Formulário de Adesão</DialogTitle>

        {done ? (
          /* ── Sucesso ── */
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
            {/* ── Header ── */}
            <div className="bg-white px-5 sm:px-7 pt-5 pb-4 sticky top-0 z-10 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-11 w-11 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                    <Zap className="h-6 w-6 text-white" fill="white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                      Adesão ao Plano de Créditos de Energia
                      {form.empresa_nome && (
                        <span className="text-brand-blue"> — {form.empresa_nome}</span>
                      )}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-[11px] text-gray-400">{TODAY_STR}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="px-4 sm:px-7 py-5 space-y-4">

              {/* Section 1: Dados pessoais + distribuidora */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Dados do Solicitante
                </p>
                {/* Row 1: Nome | Distribuidora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nome completo" required>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={form.nome}
                        onChange={(e) => set("nome")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <Field label="Distribuidora" required>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
                      <select
                        value={form.distribuidora_id}
                        onChange={(e) => handleDistrib(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white appearance-none"
                      >
                        <option value="">Selecione</option>
                        {distribuidoras.map((d) => (
                          <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                      </select>
                      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Field>
                </div>
                {/* Row 2: CPF | Email | Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="CPF ou CNPJ" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.cpf_cnpj}
                        onChange={(e) => set("cpf_cnpj")(maskCpfCnpj(e.target.value))}
                        inputMode="numeric"
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <Field label="E-mail" required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={form.email}
                        onChange={(e) => set("email")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <Field label="Telefone" required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.telefone}
                        onChange={(e) => set("telefone")(maskTelefone(e.target.value))}
                        inputMode="numeric"
                        className={INPUT}
                      />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Section 2: Embaixador */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <Field label="Código do Parceiro (opcional)">
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Código do parceiro"
                        value={form.codigo_embaixador}
                        onChange={(e) => set("codigo_embaixador")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <div className="flex gap-2 items-start sm:pt-[22px]">
                    <div className="h-5 w-5 rounded-full bg-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[9px] font-bold leading-none">i</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Preencha apenas se um parceiro ou vendedor estiver te atendendo pessoalmente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Documentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Documento com foto */}
                <div className="border border-brand-blue/30 rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-brand-blue leading-tight">
                      Documento com foto<br />
                      <span className="font-semibold text-gray-500">(RG ou CNH)</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <FileUploadField
                      label="Anexar frente"
                      sublabel="pdf ou imagem"
                      accept={ACCEPT}
                      file={docFrente}
                      onChange={setDocFrente}
                    />
                    <FileUploadField
                      label="Anexar verso"
                      sublabel="pdf ou imagem"
                      accept={ACCEPT}
                      file={docVerso}
                      onChange={setDocVerso}
                    />
                  </div>
                </div>

                {/* Fatura */}
                <div className="border-2 border-dashed border-green-300 rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-green-700 leading-tight">
                      Fatura de Luz<br />
                      <span className="font-semibold text-gray-500">mais recente</span>
                    </p>
                  </div>
                  <FileUploadField
                    label="Anexar fatura"
                    sublabel="pdf ou imagem"
                    accept={ACCEPT}
                    file={fatura}
                    onChange={setFatura}
                  />
                </div>
              </div>

              {/* Section 4: WhatsApp */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 text-white">
                    <WaIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-green-800 text-sm">Prefere enviar pelo WhatsApp?</p>
                      <span className="text-[11px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                        ❤️ Atendimento humanizado
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mb-3">
                      Dificuldade para anexar documentos? Nossa equipe te ajuda diretamente pelo WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/5543996796546?text=${encodeURIComponent("Olá! Quero fazer adesão ao plano de energia pelo portal Poupe Energia.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20b958] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      <WaIcon className="h-4 w-4" />
                      Enviar documentos pelo WhatsApp
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-green-200">
                  {[
                    { icon: "📱", text: "Tire fotos dos documentos" },
                    { icon: "📤", text: "Envie pelo WhatsApp" },
                    { icon: "🎧", text: "Atendimento humanizado" },
                  ].map((item) => (
                    <div key={item.text} className="flex flex-col items-center text-center gap-1">
                      <span className="text-xl">{item.icon}</span>
                      <p className="text-[10px] text-green-700 leading-tight">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aceite */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => set("aceite_termos")(!form.aceite_termos)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                    form.aceite_termos ? "bg-brand-blue border-brand-blue" : "border-gray-300 bg-white"
                  }`}
                >
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
              <div className="pb-1">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition ${
                    canSubmit && !submitting
                      ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar dados para gerar contrato
                    </>
                  )}
                </button>

                {/* Footer 3-col */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-1.5">
                    <Mail className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Contrato enviado por e-mail para assinatura digital.
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <svg className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Leia atentamente antes de assinar.
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <svg className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={WA_PATH} />
                    </svg>
                    <p className="text-[10px] text-gray-500 leading-tight">Dúvidas? Nós te ajudamos :)</p>
                  </div>
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-3">
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
