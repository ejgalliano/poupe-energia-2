import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  User, Mail, Phone, CreditCard, Building2, Gift,
  Upload, FileText, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Distribuidora { id: string; nome: string; }
interface Empresa { id: string; nome: string; }

// ── File upload field ─────────────────────────────────────────────────────────
function FileUploadField({
  label, sublabel, accept, file, onChange, uploading, uploaded, error,
}: {
  label: string; sublabel?: string; accept: string;
  file: File | null; onChange: (f: File | null) => void;
  uploading?: boolean; uploaded?: boolean; error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition text-left ${
          error
            ? "border-red-400 bg-red-50"
            : uploaded
            ? "border-green-400 bg-green-50"
            : file
            ? "border-brand-blue/50 bg-brand-blue/5"
            : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-brand-blue shrink-0 animate-spin" />
        ) : uploaded ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        ) : error ? (
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
        ) : (
          <Upload className="h-5 w-5 text-brand-blue shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${uploaded ? "text-green-700" : error ? "text-red-600" : "text-brand-blue"}`}>
            {error ? error : uploaded ? "Enviado ✓" : file ? file.name : label}
          </p>
          {sublabel && !file && (
            <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
          )}
          {file && !uploaded && !error && (
            <p className="text-xs text-gray-400 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB — clique para trocar
            </p>
          )}
        </div>
        {preview && (
          <img src={preview} alt="preview" className="h-10 w-10 rounded object-cover shrink-0 border border-gray-200" />
        )}
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

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, color = "blue" }: { icon: React.ElementType; title: string; color?: "blue" | "green" }) {
  const bg = color === "green" ? "bg-[#25D366]" : "bg-brand-blue";
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-base font-bold text-brand-blue">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

// ── Input wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {required && <span className="text-brand-blue mr-0.5">*</span>}{label}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";
const SELECT = "w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white text-gray-700 appearance-none";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export default function AtivarCashback() {
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    nome: "", cpf_cnpj: "", email: "", telefone: "",
    distribuidora_id: "", distribuidora_nome: "",
    empresa_id: "", empresa_nome: "",
    codigo_embaixador: "",
    aceite_termos: false,
  });

  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);
  const [fatura, setFatura] = useState<File | null>(null);
  const [uploadErros, setUploadErros] = useState<Record<string, string | null>>({});

  useEffect(() => {
    supabase.from("distribuidoras").select("id, nome").order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
    supabase.from("empresas").select("id, nome")
      .eq("ativa", true).neq("tipo_fornecedor", "intermediador").order("nome")
      .then(({ data }) => setEmpresas(data ?? []));
  }, []);

  const set = (field: string) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleDistrib = (id: string) => {
    const d = distribuidoras.find((x) => x.id === id);
    setForm((f) => ({ ...f, distribuidora_id: id, distribuidora_nome: d?.nome ?? "" }));
  };
  const handleEmpresa = (id: string) => {
    const e = empresas.find((x) => x.id === id);
    setForm((f) => ({ ...f, empresa_id: id, empresa_nome: e?.nome ?? "" }));
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("documentos-adesao")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return null;
    return data.path;
  };

  const canSubmit =
    form.nome && form.cpf_cnpj && form.email && form.telefone &&
    form.distribuidora_id && docFrente && docVerso && fatura &&
    form.aceite_termos;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setUploadErros({});

    try {
      const ts = Date.now();
      const folder = `${ts}_${form.cpf_cnpj.replace(/\D/g, "").slice(0, 11)}`;

      const [frente, verso, fat] = await Promise.all([
        uploadFile(docFrente!, `${folder}/doc_frente.${docFrente!.name.split(".").pop()}`),
        uploadFile(docVerso!, `${folder}/doc_verso.${docVerso!.name.split(".").pop()}`),
        uploadFile(fatura!, `${folder}/fatura.${fatura!.name.split(".").pop()}`),
      ]);

      if (!frente || !verso || !fat) {
        toast.error("Erro ao enviar arquivos. Tente novamente.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("cashback_cadastros").insert({
        nome: form.nome,
        cpf_cnpj: form.cpf_cnpj,
        email: form.email,
        telefone: form.telefone,
        whatsapp: form.telefone,
        distribuidora_id: form.distribuidora_id || null,
        distribuidora_nome: form.distribuidora_nome || null,
        empresa_id: form.empresa_id || null,
        empresa_nome: form.empresa_nome || null,
        codigo_embaixador: form.codigo_embaixador || null,
        doc_frente_url: frente,
        doc_verso_url: verso,
        fatura_url: fat,
        aceite_termos: form.aceite_termos,
        ciente_parcela_unica: true,
        autoriza_validacao: true,
        status: "pendente",
      });

      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SEO title="Cadastro Enviado! | Poupe Energia" description="Seus dados foram recebidos com sucesso." />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Cadastro Enviado!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Seus dados e documentos foram recebidos com sucesso. Nossa equipe irá analisar
              as informações e entrará em contato em breve pelo telefone informado.
            </p>
            <Link to="/" className="inline-block bg-brand-blue text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-brand-blue/90 transition">
              Voltar ao início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO title="Aderir ao Plano de Energia | Poupe Energia" description="Preencha seus dados para contratar energia através do portal Poupe Energia." />
      <Header />

      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl">

          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="bg-brand-blue px-5 sm:px-8 pt-6 pb-5 sm:pt-8 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-xs sm:text-sm font-medium">Formulário de Adesão</p>
                  <h1 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                    Plano de Créditos de Energia
                    {form.empresa_nome && (
                      <span className="block text-brand-yellow">{form.empresa_nome}</span>
                    )}
                  </h1>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-7 space-y-7 sm:space-y-8">

              {/* Dados pessoais */}
              <div>
                <SectionHeading icon={User} title="Dados do Solicitante" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nome completo (representante legal)" required>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" placeholder="Digite o nome completo" value={form.nome}
                        onChange={(e) => set("nome")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>

                  <Field label="CPF ou CNPJ" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" placeholder="000.000.000-00" value={form.cpf_cnpj}
                        onChange={(e) => set("cpf_cnpj")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>

                  <Field label="E-mail" required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="email" placeholder="exemplo@email.com" value={form.email}
                        onChange={(e) => set("email")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>

                  <Field label="Telefone celular" required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="tel" placeholder="(00) 00000-0000" value={form.telefone}
                        onChange={(e) => set("telefone")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Distribuidora e empresa */}
              <div>
                <SectionHeading icon={Building2} title="Dados da Energia" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Distribuidora" required>
                    <div className="relative">
                      <select value={form.distribuidora_id} onChange={(e) => handleDistrib(e.target.value)} className={SELECT}>
                        <option value="">Selecione a distribuidora</option>
                        {distribuidoras.map((d) => (
                          <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Field>

                  <Field label="Comercializadora">
                    <div className="relative">
                      <select value={form.empresa_id} onChange={(e) => handleEmpresa(e.target.value)} className={SELECT}>
                        <option value="">Selecione (opcional)</option>
                        {empresas.map((e) => (
                          <option key={e.id} value={e.id}>{e.nome}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Código do Embaixador */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <Field label="Código do Embaixador (opcional)">
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" placeholder="Digite o código do embaixador" value={form.codigo_embaixador}
                        onChange={(e) => set("codigo_embaixador")(e.target.value)} className={INPUT} />
                    </div>
                  </Field>
                  <div className="flex gap-2 pt-1 sm:pt-6">
                    <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Só preencha este campo se houver um embaixador/vendedor atendendo você pessoalmente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* RG/CNH */}
                  <div>
                    <SectionHeading icon={FileText} title="Documento com foto (RG ou CNH)" />
                    <div className="space-y-3">
                      <FileUploadField
                        label="Anexar frente do documento"
                        sublabel="pdf ou imagem"
                        accept={ACCEPT}
                        file={docFrente}
                        onChange={setDocFrente}
                        error={uploadErros["frente"]}
                      />
                      <FileUploadField
                        label="Anexar verso do documento"
                        sublabel="pdf ou imagem"
                        accept={ACCEPT}
                        file={docVerso}
                        onChange={setDocVerso}
                        error={uploadErros["verso"]}
                      />
                    </div>
                  </div>

                  {/* Fatura */}
                  <div>
                    <SectionHeading icon={FileText} title="Fatura de Luz mais recente" color="green" />
                    <FileUploadField
                      label="Anexar fatura de Luz"
                      sublabel="pdf ou imagem"
                      accept={ACCEPT}
                      file={fatura}
                      onChange={setFatura}
                      error={uploadErros["fatura"]}
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp alternativo */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-green-800">Prefere enviar pelo WhatsApp?</p>
                      <span className="text-[11px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">💚 Atendimento humanizado</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Se tiver dificuldade para anexar documentos ou preencher os dados, nossa equipe pode te ajudar diretamente pelo WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/5543996796546?text=${encodeURIComponent("Olá! Quero fazer adesão ao plano de energia pelo portal Poupe Energia.")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#25D366] hover:bg-[#20b958] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Enviar documentos pelo WhatsApp
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-green-200">
                  {[
                    { icon: "📱", text: "Tire fotos dos documentos pelo celular" },
                    { icon: "📤", text: "Envie sua fatura e documentos diretamente pelo WhatsApp" },
                    { icon: "🎧", text: "Atendimento rápido e humanizado" },
                  ].map((item) => (
                    <div key={item.text} className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-1 sm:text-center">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <p className="text-[11px] text-green-700 leading-tight">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aceite */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => set("aceite_termos")(!form.aceite_termos)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                    form.aceite_termos ? "bg-brand-blue border-brand-blue" : "border-gray-300 bg-white hover:border-brand-blue/50"
                  }`}
                >
                  {form.aceite_termos && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 leading-snug">
                  Declaro que li e aceito os{" "}
                  <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                    Termos e Condições
                  </Link>{" "}
                  e autorizo a validação dos meus dados junto à comercializadora parceira.
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full py-4 rounded-xl font-extrabold text-white text-sm tracking-wide flex items-center justify-center gap-2 transition ${
                  canSubmit && !submitting
                    ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
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

              {/* Rodapé do form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                {[
                  { icon: <Mail className="h-5 w-5 text-brand-blue" />, text: "O contrato será enviado por e-mail e WhatsApp para assinatura digital." },
                  { icon: <svg className="h-5 w-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, text: "Leia atentamente antes de assinar." },
                  { icon: <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, text: "Dúvidas? nós te ajudamos :)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">{item.icon}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400">
                🔒 Seus dados estão protegidos. Utilizamos criptografia e seguimos a LGPD.
              </p>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
